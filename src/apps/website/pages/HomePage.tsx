import { useRef, type FormEvent } from 'react'
import { adminPortalUrl, appStoreLinks } from '../../../config/hosts'
import styles from './HomePage.module.css'

const contactSubjects = [
  'Discuss the Proposal',
  'Request Budget Adjustment',
  'Schedule a Demo',
  'General Enquiry',
] as const

const contactDetails = [
  {
    label: 'Email',
    value: 'frederickohe@gmail.com',
    href: 'mailto:frederickohe@gmail.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M2.5 5.83 10 10.83l7.5-5M3.33 15h13.34c.92 0 1.67-.75 1.67-1.67V6.67c0-.92-.75-1.67-1.67-1.67H3.33c-.92 0-1.67.75-1.67 1.67v6.66c0 .92.75 1.67 1.67 1.67Z"
          stroke="currentColor"
          strokeWidth="1.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Phone',
    value: '+233 247 291 736',
    href: 'tel:+233247291736',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M5.83 3.33h2.5l1.25 2.92-1.67 1.67c.75 1.5 2 2.75 3.5 3.5l1.67-1.67 2.92 1.25v2.5c0 .92-.75 1.67-1.67 1.67-7.36 0-13.33-5.97-13.33-13.33 0-.92.75-1.67 1.66-1.67Z"
          stroke="currentColor"
          strokeWidth="1.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Address',
    value: 'Pelican Group Building, Dzorwulu, Accra',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 17.5s5.83-3.88 5.83-8.33a5.83 5.83 0 1 0-11.66 0c0 4.45 5.83 8.33 5.83 8.33Z"
          stroke="currentColor"
          strokeWidth="1.67"
        />
        <circle cx="10" cy="9.17" r="1.67" stroke="currentColor" strokeWidth="1.67" />
      </svg>
    ),
  },
  {
    label: 'Website',
    value: 'greenbraintechnologies.com',
    href: 'https://greenbraintechnologies.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.67" />
        <path d="M2.5 10h15M10 2.5a12 12 0 0 1 0 15M10 2.5a12 12 0 0 0 0 15" stroke="currentColor" strokeWidth="1.67" />
      </svg>
    ),
  },
] as const

const stats = [
  { value: '1890', label: 'Established', color: '#cc0000' },
  { value: '5 Phases', label: 'Rollout Plan', color: '#1d6fb8' },
  { value: '6 Months', label: 'Time to Launch', color: '#0f7e5a' },
] as const

const painPoints = [
  {
    title: 'Manual & Paper-Based Processes',
    description:
      'Registration, renewals, and event sign-ups are largely paper-based, causing delays and inefficiencies in data management.',
    accent: '#cc0000',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Limited Accessibility',
    description:
      'Members must visit physical branches for most transactions, discouraging participation among younger, tech-savvy demographics.',
    accent: '#1d6fb8',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s6-5.33 6-10a6 6 0 1 0-12 0c0 4.67 6 10 6 10Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Poor Communication Channels',
    description:
      'Reliance on in-person announcements and sporadic emails results in low engagement and missed updates on programs and events.',
    accent: '#0f7e5a',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Inefficient Payment Systems',
    description:
      'Cash and bank transfers for membership fees create accountability challenges and financial tracking difficulties.',
    accent: '#b45309',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Low Member Retention',
    description:
      'Without a centralised digital platform, members lack easy access to YMCA resources, reducing long-term involvement.',
    accent: '#7c3aed',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 17l4-8 4 4 4-6 4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const

const objectives = [
  'Automated Membership Management',
  'Enhanced Communication System',
  'Simplified Fees & Payment System',
  'USSD Short Code for Core Activities',
  'Engagement & Retention System',
] as const

const features = [
  {
    title: 'Electronic Membership Renewal & Dues Payment',
    accent: '#cc0000',
    items: [
      'In-app payment processing for renewals, dues, and donations',
      'Automated digital receipts for all payments',
      'Transparent financial records accessible to members',
      'Renewal reminders and expiry notifications',
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Digital Member Registration & Onboarding',
    accent: '#1d6fb8',
    items: [
      'Streamlined digital registration with smart forms',
      'Capture personal details, interests, and program preferences',
      'Location-aware branch assignment',
      'Instant digital membership ID issuance',
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" />
        <path d="M16 11h5M18.5 8.5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'USSD Short Code Implementation',
    accent: '#0f7e5a',
    items: [
      'Accessible USSD short code on all mobile networks',
      'Non-tech-savvy members can access essential activities',
      'USSD for renewal and dues payment without a smartphone',
      'Ensuring inclusion across all demographics',
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Efficient Member Communication',
    accent: '#b45309',
    items: [
      'Push notifications for announcements and program updates',
      'Upcoming events, workshops, and volunteer opportunities',
      'Wide-range project publicity for fundraising',
      'Real-time broadcast to all members across branches',
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 8a3 3 0 1 0-6 0v5l-2 2h10l-2-2V8Z" stroke="currentColor" strokeWidth="2" />
        <path d="M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Improved Member Engagement & Retention',
    accent: '#7c3aed',
    items: [
      'View and connect with other members across branches',
      'Member profiles with skills, interests, and history',
      'Personalised content recommendations',
      'Gamification — rewards for participation',
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
        <path d="M16 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2" />
        <path d="M2 20c0-3 2.5-5 6-5M14 15c3.5 0 6 2 6 5" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Feedback, Satisfaction & Surveying',
    accent: '#0e7490',
    items: [
      'In-app surveys and polls for member feedback',
      'Data-driven decision making for programs',
      'Actionable insights to tailor services',
      'Built-in analytics dashboard for administrators',
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
] as const

const outcomes = [
  {
    title: 'Increased Membership Retention',
    description:
      'Seamless digital experience appeals to tech-savvy youth, boosting retention and attracting new members.',
    accent: '#cc0000',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M2 14l5-6 4 3 7-9" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Enhanced Administrative Efficiency',
    description:
      'Automation of registration, renewals, and payments reduces staff burden, freeing resources for programming.',
    accent: '#1d6fb8',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2v4M10 14v4M4.93 4.93l2.83 2.83M12.24 12.24l2.83 2.83M2 10h4M14 10h4M4.93 15.07l2.83-2.83M12.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Improved Communication & Engagement',
    description:
      'Real-time push notifications and in-app interaction keep members informed and actively engaged.',
    accent: '#0f7e5a',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M13 7a2 2 0 1 0-4 0v4l-1.5 1.5H9l-1.5-1.5V7" stroke="currentColor" strokeWidth="1.67" />
        <path d="M8.5 16h3" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Transparent Financial Processes',
    description:
      'Secure in-app payments and financial records increase accountability and simplify audit processes.',
    accent: '#b45309',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2.5 3.5 5v5c0 4 2.75 6.75 6.5 7.5C14.25 16.75 17 14 17 10V5L10 2.5Z" stroke="currentColor" strokeWidth="1.67" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Data-Driven Decision Making',
    description:
      'Built-in feedback mechanisms collect actionable insights to help tailor programs and services.',
    accent: '#7c3aed',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3.33 16.67V3.33M3.33 16.67h13.34M6.67 13.33V10M10 13.33V6.67M13.33 13.33v-2.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Accessibility & Inclusion',
    description:
      'USSD interface ensures all members — including those without smartphones — can participate fully.',
    accent: '#0e7490',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.67" />
        <path d="M2.5 10h15M10 2.5a12 12 0 0 1 0 15M10 2.5a12 12 0 0 0 0 15" stroke="currentColor" strokeWidth="1.67" />
      </svg>
    ),
  },
  {
    title: 'Strengthened Community',
    description:
      'Enable members to interact, collaborate, and share experiences, strengthening YMCA\'s national impact.',
    accent: '#be185d',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.67" />
        <path d="M13 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" stroke="currentColor" strokeWidth="1.67" />
        <path d="M1.67 16.67c0-2.5 2-4.17 5.33-4.17M11.67 13.33c2.5 0 4.5 1.25 5.33 3.34" stroke="currentColor" strokeWidth="1.67" />
      </svg>
    ),
  },
] as const

function ArrowRightIcon() {
  return (
    <svg
      className={styles.buttonIcon}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.17 10h11.66M10 4.17l5.83 5.83L10 15.83"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.67" stroke="currentColor" strokeWidth="1.33" />
      <path
        d="M5.5 8.17 7 9.67 10.5 6.17"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const appLogoSrc = '/ymca-logo.png'

export function HomePage() {
  const summaryRef = useRef<HTMLElement>(null)
  const adminUrl = adminPortalUrl()

  const scrollToContent = () => {
    summaryRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <div className={styles.homePage}>
      <section className={styles.landing} aria-label="Landing">
        <img
          className={styles.backgroundImage}
          src="/images/landing-hero.png"
          alt=""
        />
        <div className={styles.backgroundOverlay} />

        <nav className={styles.topNav} aria-label="Primary">
          <a
            href="#"
            className={styles.navBrand}
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <img src={appLogoSrc} alt="YMCA Ghana" className={styles.navLogo} />
            <span className={styles.navBrandText}>
              <span className={styles.navBrandTitle}>YMCA Ghana</span>
              <span className={styles.navBrandSubtitle}>Member App Project</span>
            </span>
          </a>

          <div className={styles.navLinks}>
            <a href="#contact" className={styles.navLink}>
              Contact
            </a>
            <a
              href={appStoreLinks.playStore}
              className={styles.navLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Play Store
            </a>
            <a
              href={appStoreLinks.appStore}
              className={styles.navLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              App Store
            </a>
          </div>
        </nav>

        <div className={styles.content}>
          <h1 className={styles.title}>
            Enhancing YMCA Ghana&apos;s
            <br />
            Membership Operations
          </h1>

          <p className={styles.description}>
            A dedicated mobile application to streamline operations, improve member
            engagement, and enhance accessibility across YMCA Ghana&apos;s branches
            nationwide.
          </p>

          <p className={styles.attribution}>
            Prepared by{' '}
            <span className={styles.attributionName}>Frederick Ohene Obuo</span> ·
            Chief Technology Officer, GreenBrain Technologies LTD · May 29, 2025
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={scrollToContent}
            >
              Explore the Solution
              <ArrowRightIcon />
            </button>
            <a className={styles.secondaryButton} href={adminUrl}>
              Login Admin Portal
            </a>
          </div>
        </div>
      </section>

      <section ref={summaryRef} id="summary" className={styles.summary}>
        <div className={styles.sectionInner}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCopy}>
              <p className={styles.eyebrow}>Executive Summary</p>
              <h2 className={styles.sectionTitle}>
                A Digital Transformation
                <br />
                for <span className={styles.accentRed}>YMCA Ghana</span>
              </h2>
              <p className={styles.bodyText}>
                YMCA Ghana has a longstanding history of promoting youth development,
                social responsibility, and healthy living. With a diverse membership base
                spanning various regions, the organisation offers programs such as
                leadership training, civic engagement, and life skills development.
              </p>
              <p className={styles.bodyText}>
                Despite its impactful programs, challenges persist in managing membership
                operations efficiently. This proposal presents a strategic initiative to
                address these gaps through a dedicated mobile application — positioning
                YMCA Ghana as a forward-thinking institution.
              </p>
              <div className={styles.stats}>
                {stats.map(({ value, label, color }) => (
                  <div key={label} className={styles.statCard}>
                    <div className={styles.statValue} style={{ color }}>
                      {value}
                    </div>
                    <div className={styles.statLabel}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.summaryMedia}>
              <div className={styles.imageFrame}>
                <img
                  src="/images/summary-youth.jpg"
                  alt="Young people volunteering together in the community"
                  className={styles.summaryImage}
                />
              </div>
              <div className={styles.serviceBadge}>
                <div className={styles.serviceBadgeValue}>50+</div>
                <div className={styles.serviceBadgeLabel}>Years of Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className={styles.problem}>
        <div className={styles.sectionInner}>
          <div className={styles.problemHeader}>
            <p className={styles.eyebrowCentered}>Needs Assessment</p>
            <h2 className={styles.problemTitle}>The Challenges We&apos;re Solving</h2>
            <p className={styles.problemLead}>
              YMCA Ghana&apos;s existing membership management system faces critical
              challenges that hinder operational efficiency and member satisfaction.
            </p>
          </div>

          <div className={styles.challengeGrid}>
            {painPoints.map(({ title, description, accent, icon }) => (
              <article key={title} className={styles.challengeCard}>
                <div
                  className={styles.challengeIcon}
                  style={{ color: accent, backgroundColor: `${accent}15` }}
                >
                  {icon}
                </div>
                <h3 className={styles.challengeTitle} style={{ color: accent }}>
                  {title}
                </h3>
                <p className={styles.challengeDescription}>{description}</p>
              </article>
            ))}

            <article className={styles.objectivesCard}>
              <p className={styles.objectivesEyebrow}>Our Objectives</p>
              <ul className={styles.objectivesList}>
                {objectives.map((item) => (
                  <li key={item} className={styles.objectivesItem}>
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="solution" className={styles.solution}>
        <div className={styles.sectionInner}>
          <div className={styles.problemHeader}>
            <p className={styles.eyebrowCentered}>Proposed Solution</p>
            <h2 className={styles.problemTitle}>
              YMCA Ghana Member App —{' '}
              <span className={styles.accentBlue}>Core Features</span>
            </h2>
            <p className={styles.problemLead}>
              Six integrated feature sets designed to modernise every aspect of YMCA
              Ghana&apos;s membership operations.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {features.map(({ title, accent, items, icon }) => (
              <article key={title} className={styles.featureCard}>
                <div
                  className={styles.featureIcon}
                  style={{ color: accent, backgroundColor: `${accent}15` }}
                >
                  {icon}
                </div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <ul className={styles.featureList}>
                  {items.map((item) => (
                    <li key={item} className={styles.featureListItem}>
                      <span
                        className={styles.featureBullet}
                        style={{ backgroundColor: accent }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="outcomes" className={styles.outcomes}>
        <div className={styles.sectionInner}>
          <div className={styles.problemHeader}>
            <p className={styles.eyebrowCentered}>Expected Outcomes</p>
            <h2 className={styles.problemTitle}>Measurable Impact</h2>
            <p className={styles.problemLead}>
              The successful implementation will deliver measurable improvements across
              operational efficiency, member satisfaction, and organisational growth.
            </p>
          </div>

          <div className={styles.outcomeGrid}>
            {outcomes.map(({ title, description, accent, icon }) => (
              <article key={title} className={styles.outcomeCard}>
                <div
                  className={styles.outcomeIcon}
                  style={{ color: accent, backgroundColor: `${accent}15` }}
                >
                  {icon}
                </div>
                <h3 className={styles.outcomeTitle} style={{ color: accent }}>
                  {title}
                </h3>
                <p className={styles.outcomeDescription}>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.conclusion}>
        <div className={styles.conclusionInner}>
          <p className={styles.conclusionEyebrow}>Conclusion</p>
          <h2 className={styles.conclusionTitle}>
            A Transformative Step Forward
            <br />
            for YMCA Ghana
          </h2>
          <p className={styles.conclusionText}>
            The proposed YMCA Ghana Member App represents a transformative step toward
            digitising membership operations, enhancing engagement, and improving service
            delivery — aligning with YMCA Ghana&apos;s mission to foster youth development
            and social responsibility.
          </p>
          <div className={styles.conclusionActions}>
            <a href="#contact" className={styles.conclusionPrimary}>
              Contact Developers
              <ArrowRightIcon />
            </a>
            <a href={adminUrl} className={styles.conclusionSecondary}>
              Login Admin Portal
            </a>
          </div>
        </div>
      </section>

      <section id="contact" className={styles.contact}>
        <div className={styles.contactGrid}>
          <div className={styles.contactInfo}>
            <p className={styles.contactEyebrow}>Get in Touch</p>
            <h2 className={styles.contactTitle}>Let&apos;s Build This Together</h2>
            <p className={styles.contactLead}>
              Ready to move forward with YMCA Ghana&apos;s digital transformation? Contact
              GreenBrain Technologies LTD to discuss the proposal or request adjustments.
            </p>

            <div className={styles.profileCard}>
              <div className={styles.profileAvatar}>FO</div>
              <div>
                <div className={styles.profileName}>Frederick Ohene Obuo</div>
                <div className={styles.profileRole}>Chief Technology Officer</div>
                <div className={styles.profileCompany}>GreenBrain Technologies LTD</div>
              </div>
            </div>

            <div className={styles.contactList}>
              {contactDetails.map((item) => (
                <div key={item.label} className={styles.contactItem}>
                  <div className={styles.contactIcon}>{item.icon}</div>
                  <div>
                    <div className={styles.contactLabel}>{item.label}</div>
                    {'href' in item && item.href ? (
                      <a
                        href={item.href}
                        className={styles.contactValue}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className={styles.contactValue}>{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className={styles.contactForm} onSubmit={handleContactSubmit}>
            <div className={styles.formRow}>
              <input className={styles.formInput} type="text" name="firstName" placeholder="First name" />
              <input className={styles.formInput} type="text" name="lastName" placeholder="Last name" />
            </div>
            <input className={styles.formInput} type="email" name="email" placeholder="Email address" />
            <input className={styles.formInput} type="text" name="organisation" placeholder="Organisation / Branch" />
            <select className={styles.formSelect} name="subject" defaultValue="">
              <option value="" disabled>
                Subject
              </option>
              {contactSubjects.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <textarea
              className={styles.formTextarea}
              name="message"
              rows={4}
              placeholder="Your message..."
            />
            <button type="submit" className={styles.formSubmit}>
              Send Message
            </button>
          </form>
        </div>
      </section>

      <footer className={styles.pageFooter}>
        <div className={styles.pageFooterInner}>
          <div className={styles.pageFooterBrand}>
            <img src={appLogoSrc} alt="" className={styles.pageFooterLogo} />
            <span className={styles.pageFooterText}>YMCA Ghana × GreenBrain Technologies</span>
          </div>
          <p className={styles.pageFooterCopy}>
            © {new Date().getFullYear()} GreenBrain Technologies LTD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
