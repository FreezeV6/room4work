from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, OfficeViewSet, BookingViewSet, ReviewViewSet, OfficeTypeViewSet, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'offices', OfficeViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'office-types', OfficeTypeViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Auth endpoints - support both with and without trailing slash
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login', CustomTokenObtainPairView.as_view(), name='token_obtain_pair_no_slash'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/refresh', TokenRefreshView.as_view(), name='token_refresh_no_slash'),
]

