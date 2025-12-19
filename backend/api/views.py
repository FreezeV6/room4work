from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Office, Booking, Review, OfficeType
from .serializers import UserSerializer, OfficeSerializer, BookingSerializer, ReviewSerializer, OfficeTypeSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from decimal import Decimal

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
