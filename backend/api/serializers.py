from rest_framework import serializers
from .models import User, Office, OfficeImage, OfficeType, Booking, Review

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'is_owner', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
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

    class Meta:
        model = Booking
        fields = ['id', 'user', 'office', 'start_date', 'end_date', 'total_price', 'status']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'office', 'rating', 'comment', 'created_at']

