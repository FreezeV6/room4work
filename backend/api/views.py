from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Office, Booking, Review, OfficeType, ContactMessage
from .serializers import UserSerializer, OfficeSerializer, BookingSerializer, ReviewSerializer, OfficeTypeSerializer, ContactMessageSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from decimal import Decimal
from django.db.models import Q
from rest_framework.views import APIView
from django.conf import settings
import requests

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [AllowAny,]
        else:
            self.permission_classes = [IsAuthenticated,]
        return super(UserViewSet, self).get_permissions()

class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.all()
    serializer_class = OfficeSerializer
    permission_classes = [AllowAny]

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        office = serializer.validated_data['office']
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']

        # Sprawdź czy daty nie kolidują z istniejącymi rezerwacjami
        conflicting_bookings = Booking.objects.filter(
            office=office,
            status__in=['confirmed', 'pending']
        ).filter(
            Q(start_date__lte=end_date) & Q(end_date__gte=start_date)
        )

        if conflicting_bookings.exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                'non_field_errors': ['Wybrany termin koliduje z istniejącą rezerwacją. Proszę wybrać inny termin.']
            })

        # Calculate number of days
        days = (end_date - start_date).days
        if days < 1:
            days = 1

        # Calculate total price
        # Assuming price is per month, calculate daily rate
        daily_price = office.price / Decimal(30)
        total_price = daily_price * Decimal(days)

        serializer.save(user=self.request.user, total_price=total_price)

    @action(detail=False, methods=['get'], url_path='office/(?P<office_id>[^/.]+)', permission_classes=[AllowAny])
    def office_bookings(self, request, office_id=None):
        bookings = Booking.objects.filter(office_id=office_id)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Allow filtering by office_id via query parameter
        queryset = self.queryset.all()
        office_id = self.request.query_params.get('office_id')
        if office_id:
            queryset = queryset.filter(office_id=office_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OfficeTypeViewSet(viewsets.ModelViewSet):
    queryset = OfficeType.objects.all()
    serializer_class = OfficeTypeSerializer
    permission_classes = [AllowAny]

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            try:
                user = User.objects.get(email=request.data.get('email'))
                response.data['user'] = UserSerializer(user).data
            except User.DoesNotExist:
                pass
        return response

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'message': 'Wiadomość została wysłana pomyślnie!'},
            status=status.HTTP_201_CREATED
        )

class GeminiChatView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Endpoint testowy do sprawdzenia czy API działa"""
        return Response({
            'status': 'online', 
            'message': 'Gemini Chat API is ready',
            'api_key_configured': bool(settings.GEMINI_API_KEY)
        })

    def post(self, request):
        print("GeminiChatView: Received request")
        prompt = request.data.get('prompt')
        context = request.data.get('context', '')

        if not settings.GEMINI_API_KEY:
            print("GeminiChatView: GEMINI_API_KEY is not set")
            return Response({'error': 'Server configuration error: API Key missing'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not prompt:
            print("GeminiChatView: No prompt provided")
            return Response({'error': 'No prompt provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            system_instruction = """
            Jesteś asystentem AI dla Room4Work - serwisu wynajmu biur.
            Twoim zadaniem jest pomoc użytkownikom w znalezieniu odpowiedniego biura do wynajęcia oraz udzielanie informacji na temat naszych usług.
            Staraj się być pomocny, cierpliwy i profesjonalny.
            Odpowiadaj po polsku, krótko i konkretnie.
            """
            full_prompt = f"{system_instruction}\n\nKontekst rozmowy: {context}\n\nUżytkownik: {prompt}"
            
            # Direct HTTP call to Gemini API
            # Using gemini-2.5-flash - the latest stable model available
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

            headers = {
                'Content-Type': 'application/json',
                'x-goog-api-key': settings.GEMINI_API_KEY
            }

            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": full_prompt}
                        ]
                    }
                ]
            }

            print("GeminiChatView: Sending request to Gemini API...")
            response = requests.post(url, headers=headers, json=payload, timeout=30)

            print(f"GeminiChatView: Response status: {response.status_code}")

            if response.status_code != 200:
                print(f"GeminiChatView: Error response: {response.text}")
                return Response({'error': f'Gemini API error: {response.status_code}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            data = response.json()

            # Extract text from response
            try:
                text_response = data['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError) as e:
                print(f"GeminiChatView: Failed to parse response: {data}")
                return Response({'error': 'Failed to parse Gemini response'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            print("GeminiChatView: Successfully received response from Gemini")
            return Response({'response': text_response})

        except requests.exceptions.Timeout:
            print("GeminiChatView: Request timeout")
            return Response({'error': 'Request timeout'}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except Exception as e:
            print(f"Gemini API Error: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
