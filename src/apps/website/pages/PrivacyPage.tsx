import { Link } from 'react-router-dom'
import { legalContact, legalPaths } from '../../../config/legal'
import { LegalPage, LegalSection, legalStyles } from './LegalPage'

export function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="24 September 2026">
      <LegalSection title="Who we are">
        <p>
          The YMCA Ghana Member App is operated by {legalContact.operator} for{' '}
          {legalContact.organisation}. This policy explains how we collect, use, and
          protect personal information when you use the mobile app, admin portal, or
          learning portal at ymemberapp.com.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <ul>
          <li>Account details such as name, email, phone number, date of birth, and password.</li>
          <li>Membership information including branch, region, occupation, and volunteer activity.</li>
          <li>Payment records for dues, renewals, and donations processed through our payment partners.</li>
          <li>App usage data such as device type, login sessions, and support requests.</li>
          <li>Optional profile content you choose to share, including photos and social links.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use your information">
        <p>We use this information to:</p>
        <ul>
          <li>Create and manage your YMCA Ghana membership account.</li>
          <li>Process payments, issue receipts, and keep financial records.</li>
          <li>Send service messages, renewal reminders, and programme updates you opt into.</li>
          <li>Operate the e-learning portal, volunteer hours, surveys, and member directory features.</li>
          <li>Protect the service against abuse and meet legal or audit obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Sharing">
        <p>
          We do not sell your personal information. We share data only with service
          providers who help us run the app (for example payment processors and hosting),
          with YMCA Ghana branch or national administrators who need it to serve members,
          or when required by law.
        </p>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          We keep account data while your membership is active. After an account is
          deleted, we remove or anonymise personal profile data. Limited payment and
          audit records may be kept where Ghanaian law or financial rules require it.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can update profile details in the app and turn off optional notifications.
          To delete your account, open Settings and choose Delete account. See our{' '}
          <Link to={legalPaths.accountDeletion}>Account deletion</Link> page for what is
          removed and what may be retained.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Privacy questions: <a href={`mailto:${legalContact.email}`}>{legalContact.email}</a>
          . Phone {legalContact.phone}. {legalContact.address}.
        </p>
      </LegalSection>

      <div className={legalStyles.cta}>
        <p>Related documents</p>
        <p>
          <Link to={legalPaths.terms}>Terms of use</Link>
          {' · '}
          <Link to={legalPaths.accountDeletion}>Account deletion</Link>
        </p>
      </div>
    </LegalPage>
  )
}
