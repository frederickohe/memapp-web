import { Link } from 'react-router-dom'
import { legalContact, legalPaths } from '../../../config/legal'
import { LegalPage, LegalSection, legalStyles } from './LegalPage'

export function AccountDeletionPage() {
  return (
    <LegalPage title="Account Deletion" updated="13 September 2026">
      <LegalSection title="How to delete your YMCA Ghana account">
        <p>
          You can request permanent deletion of your YMCA Ghana Member App account at any
          time. Deletion is available to every user who created an account in the mobile
          app or on the web portals.
        </p>
        <p>Send an email from the address on your account to:</p>
        <p>
          <a href={`mailto:${legalContact.email}?subject=YMCA%20account%20deletion%20request`}>
            {legalContact.email}
          </a>
        </p>
        <p>Use the subject line “YMCA account deletion request” and include:</p>
        <ul>
          <li>Full name on the account</li>
          <li>Registered email and phone number</li>
          <li>Branch, if you know it</li>
          <li>A short statement that you want the account permanently deleted</li>
        </ul>
        <p>
          You can also ask a branch, regional, or national administrator to start deletion
          for you, or call {legalContact.phone}.
        </p>
      </LegalSection>

      <LegalSection title="What happens next">
        <ul>
          <li>We verify that the request comes from the account holder.</li>
          <li>We delete or deactivate the account within 14 days of verification.</li>
          <li>You will receive a confirmation email when deletion is complete.</li>
          <li>After deletion you will no longer be able to sign in to the member app, admin portal, or learning portal with that account.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Data that is deleted">
        <p>When your account is deleted we remove:</p>
        <ul>
          <li>Your profile, login credentials, and membership record</li>
          <li>Photos, social links, and other content you uploaded</li>
          <li>App preferences, device PIN, and notification settings</li>
          <li>Learning enrolments and in-app messages associated with your user id</li>
        </ul>
      </LegalSection>

      <LegalSection title="Data that may be retained">
        <p>
          We may keep limited records that we are required to hold for legal, tax, or
          audit reasons. This can include payment receipts, volunteer-hour approvals, and
          anonymised statistics that no longer identify you. Retained records are not used
          to restore your account.
        </p>
      </LegalSection>

      <LegalSection title="If you only want to stop using the app">
        <p>
          Uninstalling the app does not delete your account. To remove your personal data
          you must submit a deletion request as described above.
        </p>
      </LegalSection>

      <div className={legalStyles.cta}>
        <p>
          Read the <Link to={legalPaths.privacy}>Privacy Policy</Link> and{' '}
          <Link to={legalPaths.terms}>Terms of Use</Link> for how we handle data while
          your account is active.
        </p>
      </div>
    </LegalPage>
  )
}
