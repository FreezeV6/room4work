import React from 'react';
import {
  FaBuilding,
  FaUsers,
  FaHandshake,
  FaLightbulb,
  FaChartLine,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaHeart
} from 'react-icons/fa';
import '../../styles/About.css';

const About = () => {
  const stats = [
    { number: '500+', label: 'Biur w ofercie', icon: <FaBuilding /> },
    { number: '10 000+', label: 'Zadowolonych klientów', icon: <FaUsers /> },
    { number: '50+', label: 'Miast w Polsce', icon: <FaMapMarkerAlt /> },
    { number: '98%', label: 'Pozytywnych opinii', icon: <FaHeart /> }
  ];

  const values = [
    {
      icon: <FaHandshake />,
      title: 'Zaufanie',
      description: 'Budujemy długotrwałe relacje oparte na wzajemnym zaufaniu i transparentności.'
    },
    {
      icon: <FaLightbulb />,
      title: 'Innowacyjność',
      description: 'Stale rozwijamy naszą platformę, aby oferować najlepsze rozwiązania.'
    },
    {
      icon: <FaChartLine />,
      title: 'Efektywność',
      description: 'Pomagamy znaleźć idealne biuro szybko i bez zbędnych formalności.'
    },
    {
      icon: <FaCheckCircle />,
      title: 'Jakość',
      description: 'Weryfikujemy każdą ofertę, aby zapewnić najwyższy standard.'
    }
  ];

  const team = [
    { name: 'Jan Kowalski', role: 'CEO & Founder', image: '👨‍💼' },
    { name: 'Anna Nowak', role: 'CTO', image: '👩‍💻' },
    { name: 'Piotr Wiśniewski', role: 'Head of Sales', image: '👨‍💼' },
    { name: 'Maria Zielińska', role: 'Customer Success', image: '👩‍💼' }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>O Room4Work</h1>
          <p>
            Jesteśmy liderem na polskim rynku wynajmu przestrzeni biurowych.
            Łączymy firmy z idealnymi miejscami do pracy od 2020 roku.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="mission-content">
          <h2>Nasza Misja</h2>
          <p>
            Wierzymy, że odpowiednia przestrzeń do pracy ma ogromny wpływ na sukces każdej firmy.
            Naszą misją jest ułatwienie przedsiębiorcom znalezienia idealnego biura,
            które będzie wspierać ich rozwój i produktywność.
          </p>
          <p>
            Dzięki Room4Work proces wynajmu biura jest prosty, szybki i przejrzysty.
            Oferujemy szeroki wybór przestrzeni - od małych gabinetów po nowoczesne open space'y
            i elastyczne coworkingi.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <h2>Nasze Wartości</h2>
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <h2>Nasz Zespół</h2>
        <p className="team-subtitle">Poznaj ludzi, którzy stoją za Room4Work</p>
        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar">{member.image}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Gotowy, aby znaleźć idealne biuro?</h2>
        <p>Dołącz do tysięcy zadowolonych klientów Room4Work</p>
        <a href="/offers" className="cta-button">Przeglądaj oferty</a>
      </section>
    </div>
  );
};

export default About;
