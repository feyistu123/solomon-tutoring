import { useState } from 'react';
import axios from 'axios';
import './Portfolio.css';
import ppImage from '../assets/pp.jpg'; 

const API = 'http://localhost:5000/api';

const GRADES = ['Nursery','KG','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'];
const FREQUENCIES = ['1 day/week','2 days/week','3 days/week','4 days/week','5 days/week','Weekends only','Flexible'];
const DURATIONS = ['1 hour','1.5 hours','2 hours','Flexible'];
const BUDGETS = ['Under 2,000 Birr/month','2,000 - 3,000 Birr/month','3,000 - 5,000 Birr/month','5,000 - 7,000 Birr/month','7,000 - 10,000 Birr/month','Above 10,000 Birr/month','Prefer not to say'];
const SOURCES = ['Friend/Family','Social Media','Google Search','School Recommendation','Flyer/Poster','Other'];

const initialForm = {
  parentName:'', email:'', phone:'', address:'',
  studentName:'', studentGrade:'', subjects:'',
  preferredDays:'', preferredTime:'', sessionFrequency:'', sessionDuration:'1.5 hours',
  budgetRange:'Prefer not to say', expectedRate:'', additionalNotes:'',
  howDidYouHear:'Other', otherSource:'', message:''
};

export default function Portfolio() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const { data } = await axios.post(`${API}/application`, form);
      setSuccess(data.message);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pf">

      {/* ── NAVBAR ── */}
      <header className="pf-nav">
        <div className="pf-nav__inner">
          <div className="pf-nav__brand" onClick={() => scrollTo('hero')}>
            <div className="pf-nav__logo">S</div>
            <span className="pf-nav__name">Mr. Solomon</span>
          </div>
          <nav className={`pf-nav__links ${menuOpen ? 'open' : ''}`}>
            <button onClick={() => scrollTo('hero')}>Home</button>
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('services')}>Services</button>
            <button onClick={() => scrollTo('testimonials')}>Testimonials</button>
            <button onClick={() => scrollTo('contact')}>Contact</button>
          </nav>
          <button className="pf-nav__cta" onClick={() => scrollTo('contact')}>Book a Session</button>
          <button className="pf-nav__burger" onClick={() => setMenuOpen(o => !o)}>
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section id="hero" className="pf-hero">
        <div className="pf-hero__inner">
          <div className="pf-hero__left">
            <span className="pf-tag">Professional Tutor · Addis Ababa</span>
            <h1 className="pf-hero__title">
              Shaping Bright<br/>
              <em>Futures</em> Through<br/>
              Education
            </h1>
            <p className="pf-hero__sub">
              Dedicated private tutor helping students from Nursery to Grade 8 build strong academic foundations, develop critical thinking, and achieve their full potential.
            </p>
            <div className="pf-hero__actions">
              <button className="pf-btn pf-btn--gold" onClick={() => scrollTo('contact')}>Get Started Today</button>
              <button className="pf-btn pf-btn--ghost" onClick={() => scrollTo('about')}>Learn More</button>
            </div>
            <div className="pf-hero__stats">
              <div className="pf-stat">
                <span className="pf-stat__num">8+</span>
                <span className="pf-stat__lbl">Years of Teaching</span>
              </div>
              <div className="pf-stat__div"/>
              <div className="pf-stat">
                <span className="pf-stat__num">150+</span>
                <span className="pf-stat__lbl">Students Helped</span>
              </div>
              <div className="pf-stat__div"/>
              <div className="pf-stat">
                <span className="pf-stat__num">95%</span>
                <span className="pf-stat__lbl">Success Rate</span>
              </div>
            </div>
          </div>
          <div className="pf-hero__right">
            <div className="pf-hero__card">
              <div className="pf-hero__avatar">
                <img src={ppImage} alt="Mr. Solomon Delesa" />
              </div>
              <h3>Mr. Solomon Delesa</h3>
              <p className="pf-hero__role">Private Tutor &amp; Educator</p>
              <div className="pf-hero__tags">
                <span>Mathematics</span>
                <span>Science</span>
                <span>English</span>
                <span>Amharic</span>
                <span>All Subjects</span>
              </div>
              <div className="pf-hero__avail">
                <span className="pf-avail-dot"/>
                Available for New Students
              </div>
            </div>
          </div>
        </div>
        <div className="pf-hero__wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#ffffff"/></svg>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="pf-about">
        <div className="pf-section__inner">
          <div className="pf-about__grid">
            <div className="pf-about__img-wrap">
              <div className="pf-about__img-bg"/>
              <div className="pf-about__img-card">
              <div className="pf-about__big-avatar">
                <img src={ppImage} alt="Profile Avatar" />
              </div>
                <div className="pf-about__badge">
                  <span className="pf-about__badge-num">8+</span>
                  <span className="pf-about__badge-txt">Years Experience</span>
                </div>
              </div>
            </div>
            <div className="pf-about__content">
              <span className="pf-label">About Me</span>
              <h2>Passionate About<br/>Every Student's Growth</h2>
              <p className="pf-about__lead">
                I am Mr. Solomon Delesa, a dedicated private tutor based in Addis Ababa with over a decade of experience helping young learners excel academically.
              </p>
              <p className="pf-about__body">
                My teaching philosophy centers on understanding each student's unique learning style and pace. I create personalized lesson plans that make complex concepts accessible, build confidence, and foster a genuine love for learning that lasts a lifetime.
              </p>
              <ul className="pf-about__list">
                <li><span className="pf-check">✓</span> Personalized one-on-one tutoring sessions</li>
                <li><span className="pf-check">✓</span> Flexible scheduling to fit your family's needs</li>
                <li><span className="pf-check">✓</span> Regular progress reports for parents</li>
                <li><span className="pf-check">✓</span> Homework help and exam preparation</li>
                <li><span className="pf-check">✓</span> Nurturing and encouraging learning environment</li>
              </ul>
              <button className="pf-btn pf-btn--navy" onClick={() => scrollTo('contact')}>Work With Me</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CURRICULUM COVERAGE ── */}
      <section id="services" className="pf-curriculum">
        <div className="pf-section__inner">
          <div className="pf-section__head">
            <span className="pf-label">Curriculum Coverage</span>
            <h2>Subjects &amp; Grade Levels</h2>
            <p>Comprehensive academic support across all core subjects, carefully aligned with the Ethiopian national curriculum from Nursery through Grade 8.</p>
          </div>
          <div className="pf-curriculum__grid">
            {[
              { icon:'📐', title:'Mathematics', grades:'All Grades', desc:'From basic counting and arithmetic to algebra, geometry, and advanced problem-solving. Building strong numerical foundations step by step.' },
              { icon:'🔬', title:'Science', grades:'Grade 1 – 8', desc:'Exploring biology, chemistry, and physics through engaging experiments and clear explanations that spark curiosity and critical thinking.' },
              { icon:'📚', title:'English Language', grades:'All Grades', desc:'Reading comprehension, creative writing, grammar, vocabulary, and communication skills for confident and fluent expression.' },
              { icon:'🌍', title:'Social Studies', grades:'Grade 1 – 8', desc:'History, geography, civics, and cultural studies to develop well-rounded, globally aware and responsible young citizens.' },
              { icon:'✍️', title:'Amharic', grades:'All Grades', desc:'Mother tongue literacy, reading, writing, and language arts to strengthen cultural identity and effective communication.' },
              { icon:'📝', title:'Exam Preparation', grades:'All Grades', desc:'Targeted preparation for school exams, national assessments, and entrance tests with proven strategies and focused practice.' },
            ].map(s => (
              <div key={s.title} className="pf-curriculum__card">
                <div className="pf-curriculum__card-top">
                  <div className="pf-curriculum__icon">{s.icon}</div>
                  <span className="pf-curriculum__grade">{s.grades}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="pf-how">
        <div className="pf-section__inner">
          <div className="pf-section__head">
            <span className="pf-label">The Process</span>
            <h2>How It Works</h2>
            <p>Getting started is simple. Here's what to expect when you reach out.</p>
          </div>
          <div className="pf-how__steps">
            {[
              { num:'01', title:'Submit Your Application', desc:'Fill out the application form with your child\'s details, grade level, subjects needed, and preferred schedule.' },
              { num:'02', title:'Initial Consultation', desc:'Mr. Solomon will contact you within 24 hours to discuss your child\'s needs, goals, and arrange a free introductory session.' },
              { num:'03', title:'Personalized Plan', desc:'A customized learning plan is created based on your child\'s strengths, areas for improvement, and academic goals.' },
              { num:'04', title:'Begin Learning', desc:'Regular tutoring sessions begin. Progress is monitored closely and parents receive updates on their child\'s development.' },
            ].map((s, i) => (
              <div key={s.num} className="pf-how__step">
                <div className="pf-how__num">{s.num}</div>
                {i < 3 && <div className="pf-how__line"/>}
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RATES & PRICING ── */}
      <section className="pf-rates">
        <div className="pf-section__inner">
          <div className="pf-section__head">
            <span className="pf-label pf-label--light">Rates &amp; Pricing</span>
            <h2 className="pf-rates__title">Tailored Rates,<br/>No Hidden Fees</h2>
            <p className="pf-rates__sub">Every family's situation is unique. Rates are discussed openly and agreed upon before sessions begin — no surprises, no hidden charges.</p>
          </div>
          <div className="pf-rates__grid">
            <div className="pf-rates__card">
              <div className="pf-rates__card-icon">🎓</div>
              <h3>Early Learners</h3>
              <div className="pf-rates__level">Nursery – Grade 2</div>
              <div className="pf-rates__price">Negotiable</div>
              <ul className="pf-rates__list">
                <li><span className="pf-check">✓</span>All core subjects covered</li>
                <li><span className="pf-check">✓</span>Flexible session frequency</li>
                <li><span className="pf-check">✓</span>Monthly progress report</li>
                <li><span className="pf-check">✓</span>Homework support included</li>
              </ul>
              <button className="pf-btn pf-btn--outline" onClick={() => scrollTo('contact')}>Enquire Now</button>
            </div>
            <div className="pf-rates__card pf-rates__card--featured">
              <div className="pf-rates__popular">Most Requested</div>
              <div className="pf-rates__card-icon">📖</div>
              <h3>Primary School</h3>
              <div className="pf-rates__level">Grade 3 – Grade 5</div>
              <div className="pf-rates__price">Negotiable</div>
              <ul className="pf-rates__list">
                <li><span className="pf-check pf-check--light">✓</span>All subjects + exam prep</li>
                <li><span className="pf-check pf-check--light">✓</span>Flexible session frequency</li>
                <li><span className="pf-check pf-check--light">✓</span>Weekly progress updates</li>
                <li><span className="pf-check pf-check--light">✓</span>Homework assistance</li>
                <li><span className="pf-check pf-check--light">✓</span>Parent communication</li>
              </ul>
              <button className="pf-btn pf-btn--gold" onClick={() => scrollTo('contact')}>Enquire Now</button>
            </div>
            <div className="pf-rates__card">
              <div className="pf-rates__card-icon">🏆</div>
              <h3>Middle School</h3>
              <div className="pf-rates__level">Grade 6 – Grade 8</div>
              <div className="pf-rates__price">Negotiable</div>
              <ul className="pf-rates__list">
                <li><span className="pf-check">✓</span>Subject specialization</li>
                <li><span className="pf-check">✓</span>Flexible session frequency</li>
                <li><span className="pf-check">✓</span>Exam preparation focus</li>
                <li><span className="pf-check">✓</span>Study skills coaching</li>
              </ul>
              <button className="pf-btn pf-btn--outline" onClick={() => scrollTo('contact')}>Enquire Now</button>
            </div>
          </div>
          <div className="pf-rates__note">
            <span className="pf-rates__note-icon">💬</span>
            <p>Rates are fully negotiable and depend on grade level, number of subjects, session frequency, and duration. Contact Mr. Solomon directly to discuss a fair arrangement that works for your family.</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="pf-testimonials">
        <div className="pf-section__inner">
          <div className="pf-section__head">
            <span className="pf-label">What Parents Say</span>
            <h2>Student Success Stories</h2>
            <p>Hear from the families whose children have benefited from Mr. Solomon's tutoring.</p>
          </div>
          <div className="pf-testi__grid">
            {[
              { name:'Meron Tadesse', child:'Grade 5 Student', text:'Mr. Solomon transformed my daughter\'s relationship with mathematics. She went from dreading the subject to genuinely enjoying it. Her grades improved from 60% to 92% in just three months!', stars:5 },
              { name:'Dawit Bekele', child:'Grade 3 Student', text:'The patience and dedication Mr. Solomon shows is remarkable. My son now reads confidently and his English writing has improved tremendously. We are very grateful for his commitment.', stars:5 },
              { name:'Hiwot Girma', child:'Grade 7 Student', text:'My daughter was struggling with science and social studies. After just two months with Mr. Solomon, she passed her exams with distinction. His teaching methods are excellent.', stars:5 },
            ].map(t => (
              <div key={t.name} className="pf-testi-card">
                <div className="pf-testi-card__stars">{'★'.repeat(t.stars)}</div>
                <p className="pf-testi-card__text">"{t.text}"</p>
                <div className="pf-testi-card__author">
                  <div className="pf-testi-card__avatar">{t.name.charAt(0)}</div>
                  <div>
                    <div className="pf-testi-card__name">{t.name}</div>
                    <div className="pf-testi-card__child">Parent of {t.child}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / APPLICATION FORM ── */}
      <section id="contact" className="pf-contact">
        <div className="pf-section__inner">
          <div className="pf-contact__grid">
            <div className="pf-contact__info">
              <span className="pf-label pf-label--light">Get In Touch</span>
              <h2>Ready to Start<br/>Your Child's Journey?</h2>
              <p>Fill out the application form and Mr. Solomon will get back to you within 24 hours to discuss how he can help your child succeed.</p>
              <div className="pf-contact__details">
                <div className="pf-contact__detail">
                  <div className="pf-contact__detail-icon">📍</div>
                  <div>
                    <div className="pf-contact__detail-title">Location</div>
                    <div className="pf-contact__detail-val">Addis Ababa, Ethiopia</div>
                  </div>
                </div>
                <div className="pf-contact__detail">
                  <div className="pf-contact__detail-icon">⏰</div>
                  <div>
                    <div className="pf-contact__detail-title">Available Hours</div>
                    <div className="pf-contact__detail-val">Mon – Sat, 7:00 AM – 8:00 PM</div>
                  </div>
                </div>
                <div className="pf-contact__detail">
                  <div className="pf-contact__detail-icon">📚</div>
                  <div>
                    <div className="pf-contact__detail-title">Grade Levels</div>
                    <div className="pf-contact__detail-val">Nursery through Grade 8</div>
                  </div>
                </div>
                <div className="pf-contact__detail">
                  <div className="pf-contact__detail-icon">✅</div>
                  <div>
                    <div className="pf-contact__detail-title">Response Time</div>
                    <div className="pf-contact__detail-val">Within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pf-contact__form-wrap">
              <div className="pf-form-card">
                <h3>Application Form</h3>
                <p>Please fill in all required fields marked with *</p>

                {success && <div className="pf-alert pf-alert--ok">✅ {success}</div>}
                {error   && <div className="pf-alert pf-alert--err">❌ {error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="pf-form__section">Parent / Guardian Information</div>
                  <div className="pf-form__row">
                    <div className="pf-field">
                      <label>Full Name *</label>
                      <input value={form.parentName} onChange={e=>set('parentName',e.target.value)} placeholder="Your full name" required/>
                    </div>
                    <div className="pf-field">
                      <label>Email Address *</label>
                      <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="your@email.com" required/>
                    </div>
                  </div>
                  <div className="pf-form__row">
                    <div className="pf-field">
                      <label>Phone Number *</label>
                      <input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+251 9XX XXX XXX" required/>
                    </div>
                    <div className="pf-field">
                      <label>Address / Area *</label>
                      <input value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Your neighborhood or area" required/>
                    </div>
                  </div>

                  <div className="pf-form__section">Student Information</div>
                  <div className="pf-form__row">
                    <div className="pf-field">
                      <label>Student's Full Name *</label>
                      <input value={form.studentName} onChange={e=>set('studentName',e.target.value)} placeholder="Student's full name" required/>
                    </div>
                    <div className="pf-field">
                      <label>Grade Level *</label>
                      <select value={form.studentGrade} onChange={e=>set('studentGrade',e.target.value)} required>
                        <option value="">Select grade level</option>
                        {GRADES.map(g=><option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pf-field pf-field--full">
                    <label>Subjects Needed *</label>
                    <input value={form.subjects} onChange={e=>set('subjects',e.target.value)} placeholder="e.g. Mathematics, English, Science" required/>
                  </div>

                  <div className="pf-form__section">Scheduling Preferences</div>
                  <div className="pf-form__row">
                    <div className="pf-field">
                      <label>Preferred Days *</label>
                      <input value={form.preferredDays} onChange={e=>set('preferredDays',e.target.value)} placeholder="e.g. Monday, Wednesday, Friday" required/>
                    </div>
                    <div className="pf-field">
                      <label>Preferred Time *</label>
                      <input value={form.preferredTime} onChange={e=>set('preferredTime',e.target.value)} placeholder="e.g. 3:00 PM – 5:00 PM" required/>
                    </div>
                  </div>
                  <div className="pf-form__row">
                    <div className="pf-field">
                      <label>Session Frequency *</label>
                      <select value={form.sessionFrequency} onChange={e=>set('sessionFrequency',e.target.value)} required>
                        <option value="">Select frequency</option>
                        {FREQUENCIES.map(f=><option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className="pf-field">
                      <label>Session Duration</label>
                      <select value={form.sessionDuration} onChange={e=>set('sessionDuration',e.target.value)}>
                        {DURATIONS.map(d=><option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pf-form__section">Budget &amp; Additional Details</div>
                  <div className="pf-form__row">
                    <div className="pf-field">
                      <label>Monthly Budget Range</label>
                      <select value={form.budgetRange} onChange={e=>set('budgetRange',e.target.value)}>
                        {BUDGETS.map(b=><option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="pf-field">
                      <label>Expected Rate (optional)</label>
                      <input value={form.expectedRate} onChange={e=>set('expectedRate',e.target.value)} placeholder="e.g. 2,500 Birr/month"/>
                    </div>
                  </div>
                  <div className="pf-form__row">
                    <div className="pf-field">
                      <label>How did you hear about us?</label>
                      <select value={form.howDidYouHear} onChange={e=>set('howDidYouHear',e.target.value)}>
                        {SOURCES.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                    {form.howDidYouHear==='Other' && (
                      <div className="pf-field">
                        <label>Please specify</label>
                        <input value={form.otherSource} onChange={e=>set('otherSource',e.target.value)} placeholder="How did you find us?"/>
                      </div>
                    )}
                  </div>
                  <div className="pf-field pf-field--full">
                    <label>Additional Notes</label>
                    <textarea rows={3} value={form.additionalNotes} onChange={e=>set('additionalNotes',e.target.value)} placeholder="Any learning challenges, special requirements, or academic goals..."/>
                  </div>
                  <div className="pf-field pf-field--full">
                    <label>Message to Mr. Solomon</label>
                    <textarea rows={3} value={form.message} onChange={e=>set('message',e.target.value)} placeholder="Anything else you'd like Mr. Solomon to know about your child..."/>
                  </div>

                  <button type="submit" className="pf-btn pf-btn--navy pf-btn--full" disabled={submitting}>
                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="pf-footer">
        <div className="pf-footer__inner">
          <div className="pf-footer__brand">
            <div className="pf-nav__logo">S</div>
            <div>
              <div className="pf-footer__name">Mr. Solomon's Tutoring</div>
              <div className="pf-footer__tagline">Shaping Bright Futures Through Education</div>
            </div>
          </div>
          <div className="pf-footer__links">
            <div className="pf-footer__col">
              <div className="pf-footer__col-title">Quick Links</div>
              <button onClick={() => scrollTo('hero')}>Home</button>
              <button onClick={() => scrollTo('about')}>About</button>
              <button onClick={() => scrollTo('services')}>Services</button>
              <button onClick={() => scrollTo('contact')}>Contact</button>
            </div>
            <div className="pf-footer__col">
              <div className="pf-footer__col-title">Services</div>
              <span>Mathematics Tutoring</span>
              <span>Science Tutoring</span>
              <span>English Language</span>
              <span>Exam Preparation</span>
            </div>
            <div className="pf-footer__col">
              <div className="pf-footer__col-title">Contact</div>
              <span>📍 Addis Ababa, Ethiopia</span>
              <span>⏰ Mon–Sat, 7AM–8PM</span>
              <span>✅ 24hr Response Time</span>
            </div>
          </div>
        </div>
        <div className="pf-footer__bottom">
          <span>© {new Date().getFullYear()} Mr. Solomon's Tutoring. All rights reserved.</span>
          <a href="/login" className="pf-footer__admin">Admin</a>
        </div>
      </footer>

    </div>
  );
}
