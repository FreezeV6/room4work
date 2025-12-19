from rest_framework import serializers
from .models import User, Office, OfficeImage, OfficeType, Booking, Review

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'company_name', 'is_owner', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False},  # Make username optional - will be auto-generated
        }

    def create(self, validated_data):
        # Auto-generate username from email if not provided
        if 'username' not in validated_data or not validated_data['username']:
            email = validated_data.get('email')
            # Use email prefix as username
            username = email.split('@')[0]
            # Ensure uniqueness by appending a number if needed
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
            validated_data['username'] = username

        user = User.objects.create_user(**validated_data)
        return user

class OfficeImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficeImage
        fields = ['id', 'image_url']

class OfficeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficeType
        fields = ['id', 'name']

class OfficeSerializer(serializers.ModelSerializer):
    images = OfficeImageSerializer(many=True, read_only=True)
    office_type = OfficeTypeSerializer(read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Office
        fields = ['id', 'name', 'address', 'description', 'price', 'owner', 'office_type', 'latitude', 'longitude', 'images']

class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    office = OfficeSerializer(read_only=True)
    office_id = serializers.PrimaryKeyRelatedField(
        queryset=Office.objects.all(), source='office', write_only=True
    )
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'office', 'office_id', 'start_date', 'end_date', 'total_price', 'status']

    def create(self, validated_data):
        office_id = validated_data.pop('office_id')
        booking = Booking.objects.create(office_id=office_id, **validated_data)
        return booking

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    office = serializers.SerializerMethodField(read_only=True)
    office_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'office', 'office_id', 'rating', 'comment', 'created_at']

    def get_office(self, obj):
        return OfficeSerializer(obj.office).data

    def create(self, validated_data):
        office_id = validated_data.pop('office_id')
        review = Review.objects.create(office_id=office_id, **validated_data)
        return review
