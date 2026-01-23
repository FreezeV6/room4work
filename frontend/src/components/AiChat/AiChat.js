import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import '../../styles/AiChat.css';

// Hook do komunikacji z API Gemini (przez backend)
const useGemini = () => {
  const [isConnected, setIsConnected] = useState(true);

  // Sprawdź połączenie z backendem
  const checkConnection = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/chat/gemini/`);
      const data = await response.json();
      setIsConnected(data.status === 'online' && data.api_key_configured);
      return data.api_key_configured;
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      return false;
    }
  };

  // Wyślij wiadomość do backendu
  const sendMessage = async (prompt, context = []) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

      const response = await fetch(`${backendUrl}/api/chat/gemini/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          context: context.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response,
      };
    } catch (error) {
      console.error('Gemini error:', error);
      return {
        success: false,
        response: null,
        error: error.message,
      };
    }
  };

  return {
    isConnected,
    checkConnection,
    sendMessage,
  };
};

// Komponent czatu AI
const AiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Cześć! Jestem asystentem Room4Work. Jak mogę Ci pomóc w znalezieniu idealnego biura?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const gemini = useGemini();

  // Sprawdź status API przy montowaniu
  useEffect(() => {
    const checkStatus = async () => {
      const connected = await gemini.checkConnection();
      setApiStatus(connected ? 'connected' : 'disconnected');
    };
    checkStatus();
  }, []);

  // Scroll do ostatniej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus na input po otwarciu
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

const getSimulatedResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();

  const knowledgeBase = [
    // --- POWITANIA ---
    {
      // 'wit', 'dobry' łapie: witam, witaj, dzień dobry
      keywords: ['cześć', 'hej', 'dobry', 'wit', 'siema', 'start', 'halo', 'elo', 'eluwina'],
      text: 'Dzień dobry! 👋 Jestem wirtualnym asystentem. Pomogę Ci znaleźć biuro, sprawdzić ceny lub wyjaśnić zasady wynajmu. W czym mogę pomóc?'
    },
    {
      keywords: ['kim jesteś', 'bot', 'robot', 'ai', 'człowiek', 'to ty'],
      text: 'Jestem asystentem AI. Jeszcze się uczę, ale chętnie pomogę Ci znaleźć idealne miejsce do pracy!'
    },
    {
      keywords: ['dzięki', 'dziękuj', 'super', 'ekstra', 'fajnie'],
      text: 'Cała przyjemność po mojej stronie! 😊 Jeśli masz jeszcze jakieś pytania, jestem tutaj.'
    },

    // --- FINANSE (Skrócone rdzenie: 'cen' łapie ceny, cena, cennik) ---
    {
      keywords: ['cen', 'koszt', 'ile', 'płatn', 'drogo', 'tani'],
      text: 'Biurka coworkingowe od 500 PLN, prywatne gabinety od 1200 PLN. Cena zależy od lokalizacji i standardu. Sprawdź cennik przy konkretnej ofercie.'
    },
    {
      keywords: ['kaucj', 'depozyt', 'zabezpiecz'],
      text: 'Kaucja wynosi zazwyczaj równowartość jednego czynszu i jest zwracana po zakończeniu umowy.'
    },
    {
      // 'faktur' łapie: faktura, faktury, fakturę, fakturować
      // 'vat' łapie: vat, vacie
      keywords: ['faktur', 'vat', 'rachun', 'rozlicz'],
      text: 'Tak, wystawiamy faktury VAT 23%. Otrzymasz je automatycznie na maila każdego miesiąca.'
    },
    {
      keywords: ['rabat', 'zniżk', 'promocj', 'kod', 'taniej'],
      text: 'Przy płatności z góry za rok oferujemy do 15% rabatu. Warto też pytać o aktualne promocje sezonowe!'
    },
    {
      // 'kart' łapie: karta, kartą, karty
      keywords: ['metod', 'płacić', 'kart', 'przelew', 'blik'],
      text: 'Płatności są proste: przelew online, BLIK lub podpięcie karty płatniczej w panelu klienta.'
    },

    // --- LOKALIZACJA ---
    {
      keywords: ['lokalizacj', 'gdzie', 'adres', 'map', 'miast', 'dzielnic'],
      text: 'Nasze biura są w centrum i kluczowych dzielnicach biznesowych. Sprawdź mapę w zakładce "Szukaj", aby znaleźć nas blisko siebie.'
    },
    {
      keywords: ['parking', 'aut', 'samochód', 'garaż', 'postoj'],
      text: 'Większość lokalizacji ma parking. Użyj filtra "Parking" w wyszukiwarce, aby znaleźć miejsca przyjazne zmotoryzowanym.'
    },
    {
      keywords: ['rower', 'stojak'],
      text: 'Jesteśmy eko! 🚲 Posiadamy rowerownie i prysznice dla cyklistów w większości naszych budynków.'
    },
    {
      keywords: ['dojazd', 'metro', 'tramwaj', 'autobus', 'komunikacj'],
      text: 'Wybieramy lokalizacje świetnie skomunikowane, blisko metra i głównych węzłów przesiadkowych.'
    },

    // --- WYPOSAŻENIE ---
    {
      keywords: ['net', 'wifi', 'wi-fi', 'łącz', 'internet'],
      text: 'Szybki światłowód (1 Gb/s) jest w cenie. Mamy bezpieczne WiFi oraz gniazda Ethernet przy każdym biurku.'
    },
    {
      keywords: ['kaw', 'herbat', 'wod', 'kuchni', 'ekspres', 'socjal'],
      text: 'Kawa z ekspresu, herbata i woda są nielimitowane i darmowe dla wszystkich najemców! ☕'
    },
    {
      keywords: ['druk', 'skan', 'kser', 'papier'],
      text: 'Drukarki i skanery są dostępne w częściach wspólnych. Masz pakiet darmowych stron w cenie abonamentu.'
    },
    {
      keywords: ['klima', 'ciepł', 'zimn', 'ogrzewan', 'temperatur'],
      text: 'Biura są klimatyzowane. W prywatnych gabinetach możesz samodzielnie sterować temperaturą.'
    },
    {
      keywords: ['mebl', 'biurk', 'fotel', 'krzesł'],
      text: 'Nie musisz kupować mebli. Zapewniamy ergonomiczne fotele i duże biurka. Wchodzisz i pracujesz.'
    },
    {
      keywords: ['sal', 'konferenc', 'spotka', 'meeting'],
      text: 'Możesz rezerwować sale konferencyjne przez aplikację. Masz pulę darmowych godzin w pakiecie.'
    },
    {
      keywords: ['24', 'godzin', 'dostęp', 'noc', 'weekend', 'klucz'],
      text: 'Dostęp do biura jest 24/7. Wchodzisz za pomocą karty lub aplikacji w telefonie, kiedy tylko chcesz.'
    },

    // --- RODZAJE BIUR ---
    {
      keywords: ['open', 'cowork', 'wspóln'],
      text: 'Open space to elastyczne biurka w otwartej przestrzeni. Idealne dla freelancerów szukających networkingu.'
    },
    {
      // 'gabinet' łapie też gabinety
      keywords: ['prywat', 'gabinet', 'zamknięt', 'pokój', 'zespół'],
      text: 'Prywatne biura to zamykane pokoje tylko dla Twojej firmy. Dostępne w rozmiarach od 2 do 20 osób.'
    },
    {
      keywords: ['wirtual', 'adres', 'rejestracj', 'korespondencj'],
      text: 'Oferujemy Wirtualne Biuro – adres do KRS/CEIDG i obsługę poczty już od 99 zł miesięcznie.'
    },

    // --- UMOWY I REZERWACJE ---
    {
      // 'umow' łapie: umowa, umowy, umowę
      keywords: ['umow', 'wypowiedzen', 'czas', 'zobowiąz'],
      text: 'Elastyczność to podstawa. Umowy standardowo mają 1-miesięczny okres wypowiedzenia, ale mamy też opcje na dni.'
    },
    {
      keywords: ['rezerw', 'wynaj', 'chcę'],
      text: 'Aby wynająć: zaloguj się, wybierz biuro na liście i kliknij "Zarezerwuj". Formalności zajmą 5 minut online.'
    },
    {
      keywords: ['dokument', 'dowód', 'nip', 'firm'],
      text: 'Do faktury potrzebujemy NIPu. Do samej rezerwacji wystarczy dowód osobisty i dane kontaktowe.'
    },
    {
      keywords: ['anul', 'odwoł', 'rezygn'],
      text: 'Rezerwację możesz anulować bezkosztowo do 24h przed startem. Zrobisz to w panelu użytkownika.'
    },

    // --- INNE ZASADY ---
    {
      keywords: ['zwierz', 'pies', 'kot', 'pupil'],
      text: 'Tak, jesteśmy pet-friendly! 🐶 Możesz przyjść z psem, o ile jest grzeczny i nie przeszkadza innym.'
    },
    {
      keywords: ['palen', 'papieros', 'dym'],
      text: 'W biurach nie palimy. Mamy wyznaczone strefy dla palących na zewnątrz lub na tarasach.'
    },
    {
      keywords: ['gość', 'klient', 'osob'],
      text: 'Możesz zapraszać gości. Spotkania najlepiej odbywać w salach konferencyjnych lub strefach socjalnych.'
    },

    // --- PROBLEMY I KONTO ---
    {
      keywords: ['logow', 'konto', 'hasł', 'login', 'nie dział'],
      text: 'Problemy z logowaniem? Spróbuj zresetować hasło linkiem "Nie pamiętam hasła" lub napisz do nas.'
    },
    {
      keywords: ['kontakt', 'telefon', 'mail', 'support', 'pomoc'],
      text: 'Nasz dział pomocy jest dostępny pod mailem kontakt@biura.pl lub telefonem +48 123 456 789.'
    },
    {
      keywords: ['app', 'aplikacj', 'mobiln'],
      text: 'Pobierz naszą aplikację, aby otwierać drzwi telefonem i rezerwować salki. Dostępna na iOS i Android.'
    }
  ];

  // --- LOGIKA POZOSTAJE TA SAMA ---
  for (const entry of knowledgeBase) {
    const match = entry.keywords.some(keyword => lowerMessage.includes(keyword));
    if (match) {
      return entry.text;
    }
  }

  return 'Dziękuję za wiadomość! Jestem prostym automatem i nie do końca zrozumiałem. Czy możesz sformułować pytanie inaczej?';
};

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Dodaj wiadomość użytkownika
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Przygotuj kontekst (ostatnie 10 wiadomości)
    const contextMessages = updatedMessages.slice(-10);

    const result = await gemini.sendMessage(userMessage, contextMessages);

    if (result.success) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.response,
      }]);
    } else {
      // Pokaż błąd użytkownikowi
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie za chwilę. (${result.error})`,
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Przycisk otwierający czat */}
      <button
        className={`ai-chat-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Otwórz czat z asystentem AI"
      >
        <FaRobot />
        <span className="chat-badge">AI</span>
      </button>

      {/* Okno czatu */}
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
        {/* Nagłówek */}
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <FaRobot />
            <div>
              <h4>Asystent AI</h4>
              <span className={`status ${apiStatus}`}>
                {apiStatus === 'connected' ? 'Online (Gemini)' :
                 apiStatus === 'checking' ? 'Łączenie...' : 'Offline'}
              </span>
            </div>
          </div>
          <button
            className="ai-chat-close"
            onClick={() => setIsOpen(false)}
            aria-label="Zamknij czat"
          >
            <FaTimes />
          </button>
        </div>

        {/* Lista wiadomości */}
        <div className="ai-chat-messages">
          {messages.map(message => (
            <div
              key={message.id}
              className={`ai-chat-message ${message.role}`}
            >
              {message.role === 'assistant' && (
                <div className="message-avatar">
                  <FaRobot />
                </div>
              )}
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="ai-chat-message assistant">
              <div className="message-avatar">
                <FaRobot />
              </div>
              <div className="message-content loading">
                <FaSpinner className="spinner" />
                <span>Piszę...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-chat-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Napisz wiadomość..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Wyślij wiadomość"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </>
  );
};

export default AiChat;

