from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Office, Booking, OfficeType
from datetime import date, timedelta

class BookingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='testpassword')
        self.client.force_authenticate(user=self.user)

        self.office_type = OfficeType.objects.create(name='Coworking')
        self.office = Office.objects.create(
            name='Test Office',
            address='123 Test St',
            description='A test office',
            price=1000.00,
            owner=self.user,
            office_type=self.office_type
        )

    def test_create_booking(self):
        url = '/api/bookings/'
        data = {
            'office_id': self.office.id,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=5)
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        self.assertEqual(Booking.objects.get().office, self.office)

    def test_get_office_bookings(self):
        Booking.objects.create(
            user=self.user,
            office=self.office,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5),
            total_price=500.00
        )
        url = f'/api/bookings/office/{self.office.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

