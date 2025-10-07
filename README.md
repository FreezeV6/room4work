# Room4Work - Platforma Rezerwacji Przestrzeni Biurowych

## O Projekcie

Room4Work to nowoczesna platforma umożliwiająca rezerwację przestrzeni biurowych, coworkingowych oraz sal konferencyjnych. Projekt został stworzony z myślą o freelancerach, małych firmach oraz wszystkich, którzy potrzebują profesjonalnej przestrzeni do pracy.

### Główne Funkcje

- Przeglądanie dostępnych przestrzeni biurowych
- Zaawansowane filtrowanie ofert (lokalizacja, cena, powierzchnia, udogodnienia)
- System rezerwacji online
- Panel użytkownika z historią rezerwacji
- Zarządzanie rezerwacjami (tworzenie, anulowanie)
- Szczegółowe opisy i galerie zdjęć biur

## Technologie

### Frontend
- React.js
- React Router
- Context API do zarządzania stanem
- CSS Modules
- React Icons

### Backend
- Python
- Flask
- PostgreSQL
- JWT do autoryzacji
- BCrypt do hashowania haseł

## Wymagania Systemowe

### Frontend
- Node.js (v14 lub nowszy)
- npm lub yarn

### Backend
- Python 3.8 lub nowszy
- PostgreSQL 12 lub nowszy

## Instalacja i Uruchomienie

### Backend

1. Przejdź do katalogu backend:
```bash
cd backend
```

2. Utwórz i aktywuj wirtualne środowisko:
```bash
python -m venv venv
source venv/bin/activate  # dla Linux/MacOS
venv\Scripts\activate     # dla Windows
```

3. Zainstaluj zależności:
```bash
pip install -r requirements.txt
```

4. Skonfiguruj zmienne środowiskowe w pliku .env:
```env
POSTGRES_DB=####
POSTGRES_USER=####
POSTGRES_PASSWORD=####
POSTGRES_HOST=####
POSTGRES_PORT=####
APP_SECRET_KEY=####
```

5. Uruchom serwer:
```bash
python app.py
```

### Frontend

1. Przejdź do katalogu frontend:
```bash
cd frontend
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom aplikację:
```bash
npm start
```

## Dostęp do Aplikacji

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Uwierzytelnianie

Aplikacja wykorzystuje JWT (JSON Web Tokens) do uwierzytelniania. Token jest przechowywany w localStorage i automatycznie dołączany do nagłówków żądań HTTP.

## Struktura Projektu

```
room4work/
├── backend/
│   ├── app.py              # Główny plik aplikacji Flask
│   ├── init_db.py          # Skrypt inicjalizacji bazy danych
│   ├── requirements.txt     # Zależności Pythona
│   ├── schema.sql          # Schema bazy danych
│   └── uploads/            # Katalog na przesyłane pliki
│
└── frontend/
    ├── public/             # Pliki statyczne
    └── src/
        ├── components/     # Komponenty React
        ├── styles/        # Pliki CSS
        ├── utils/         # Narzędzia i helpers
        └── assets/        # Zasoby (obrazy, ikony)
```

# TODO
### Faza 1
- [ ] Dodanie funkcji recenzji i ocen dla przestrzeni biurowych
- [ ] Implementacja powiadomień e-mail dla rezerwacji i anulacji
- [ ] Naprawa wyświetlania zdjęć
- [ ] Optymalizacja zapytań do bazy danych
- [ ] Naprawa wyświetlania lokalizacji w offers
- [ ] Dodanie mapy do OfferDetails
- [ ] Implementacja CRM
- [ ] Naprawa styli filtrowania
- [ ] Lepszy UX/UI
- [ ] About page
- [ ] Contact page
### Faza 2
- [ ] Dodanie AI do sugestii przestrzeni biurowych na podstawie preferencji użytkownika
