# 🏢 Room4Work - Platforma Rezerwacji Przestrzeni Biurowych

Nowoczesna aplikacja do rezerwacji biur, sal konferencyjnych i przestrzeni coworkingowych.

## 🎯 Główne Funkcje

- ✅ Przeglądanie dostępnych przestrzeni biurowych
- ✅ Zaawansowane filtrowanie (lokalizacja, cena, powierzchnia, udogodnienia)
- ✅ System rezerwacji online
- ✅ Panel użytkownika z historią rezerwacji
- ✅ Zarządzanie rezerwacjami (tworzenie, anulowanie)
- ✅ Szczegółowe opisy i galerie zdjęć

## 🛠️ Technologia

### Frontend
- **React.js** - UI framework
- **React Router** - Routing
- **Context API** - State management
- **CSS** - Stylizacja
- **React Icons** - Ikony

### Backend
- **Django** - Web framework
- **Django REST Framework** - REST API
- **PostgreSQL** - Baza danych
- **JWT** - Autentykacja
- **Python 3.11+** - Runtime

## 📋 Wymagania

- Python 3.11+
- Node.js 16+
- PostgreSQL 12+
- npm/yarn

## ⚡ Quick Start

### Backend (Django)

```bash
cd backend

# Wirtualne środowisko
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# lub
.venv\Scripts\activate     # Windows

# Zależności
pip install -r requirements.txt

# Konfiguracja (skopiuj .env.example na .env i uzupełnij)
cp .env.example .env

# Migracje bazy
python manage.py migrate

# Superuser (admin)
python manage.py createsuperuser

# Start serwera
python manage.py runserver
```

Backend dostępny: `http://localhost:8000`

### Frontend (React)

```bash
cd frontend

# Zależności
npm install

# Konfiguracja (skopiuj .env.example na .env)
cp .env.example .env

# Development server
npm start
```

Frontend dostępny: `http://localhost:3000`

## 📚 Dokumentacja

- **[SETUP.md](./SETUP.md)** - Pełne instrukcje instalacji i konfiguracji
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Podsumowanie zmian

## 🔌 API Endpoints

### Auth
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token

### Users
- `POST /api/users/` - Register
- `GET /api/users/{id}/` - Get user
- `PUT /api/users/{id}/` - Update user

### Offices
- `GET /api/offices/` - List offices
- `GET /api/offices/{id}/` - Get office
- `POST /api/offices/` - Create office
- `PUT /api/offices/{id}/` - Update office
- `DELETE /api/offices/{id}/` - Delete office

### Bookings
- `GET /api/bookings/` - My bookings
- `POST /api/bookings/` - Create booking
- `DELETE /api/bookings/{id}/` - Cancel booking

### Reviews
- `GET /api/reviews/?office_id={id}` - Get reviews
- `POST /api/reviews/` - Create review

## 📁 Struktura Projektu

```
room4work/
├── backend/
│   ├── api/
│   │   ├── models.py        # Django models
│   │   ├── views.py         # ViewSets
│   │   ├── serializers.py   # Serializers
│   │   ├── urls.py          # API routes
│   │   └── migrations/       # DB migrations
│   ├── src/
│   │   ├── settings.py      # Django settings
│   │   ├── urls.py          # Main routes
│   │   ├── wsgi.py          # WSGI config
│   │   └── asgi.py          # ASGI config
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── styles/          # CSS files
│   │   ├── utils/           # Helpers (auth, etc)
│   │   ├── assets/          # Images, logos
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── SETUP.md                 # Setup guide
└── IMPLEMENTATION_SUMMARY.md # Changes summary
```

## 🚀 Deployment

### Render

**Backend:**
1. Push to GitHub
2. Create Web Service on Render
3. Set environment variables (POSTGRES_*, SECRET_KEY)
4. Build: `bash build.sh`
5. Start: `gunicorn src.wsgi:application`

**Frontend:**
1. Push to GitHub
2. Create Static Site on Render
3. Build: `npm install && npm run build`
4. Publish: `build/`

## 🔐 Autentykacja

- JWT tokens przechowywane w `localStorage`
- Token wysyłany w nagłówku: `Authorization: Bearer {token}`
- Tokens:
  - `access` - Short-lived (60 min)
  - `refresh` - Long-lived (1 day)

## 🐛 Troubleshooting

### "Connection refused" na DB
```bash
# Sprawdź PostgreSQL
psql -U postgres
```

### "Invalid token" error
```javascript
// Sprawdź localStorage
console.log(localStorage.getItem('token'))
```

### CORS errors
- Sprawdź `CORS_ALLOWED_ORIGINS` w `settings.py`
- Frontend URL musi być dodany

### 404 na API
- Sprawdź trailing slashe: `/api/offices/` nie `/api/offices`

## 📝 Development Tips

### Django Shell
```bash
python manage.py shell
```

### Create superuser
```bash
python manage.py createsuperuser
```

### Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

## 🎓 Zmiany w kodzie (v2.0)

- ✅ DateField zamiast DateTimeField dla rezerwacji
- ✅ Auto-generation username z email
- ✅ Ulepszone error handling
- ✅ JWT token obsługa (`data.access`)
- ✅ CORS prawidłowo skonfigurowany
- ✅ Trailing slashe na wszystkich endpoints

Szczegóły: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## 📋 TODO

- [ ] Email notifications (booking, cancellation)
- [ ] Reviews and ratings
- [ ] Map integration (Google Maps)
- [ ] Advanced search filters
- [ ] User dashboard
- [ ] Admin panel improvements
- [ ] Payment integration
- [ ] Calendar view for bookings
- [ ] Multi-language support

## 👤 Author

GitHub Copilot - Code Implementation

## 📄 License

MIT License

## 📞 Support

1. Sprawdź [SETUP.md](./SETUP.md) dla instalacji
2. Sprawdź [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) dla zmian
3. Sprawdź logs w terminalu/console

---

**Status: ✅ Gotowy do wdrożenia | Ready for deployment**

