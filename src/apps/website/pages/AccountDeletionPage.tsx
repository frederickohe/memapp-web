import { Link } from 'react-router-dom'
import { legalContact, legalPaths } from '../../../config/legal'
import { LegalPage, LegalSection, legalStyles } from './LegalPage'

export function AccountDeletionPage() {
  return (
    <LegalPage title="Account Deletion" updated="24 September 2026">
      <LegalSection title="How to delete your YMCA Ghana account">
        <p>
          You can permanently delete your YMCA Ghana Member App account at any time from
          inside the app. Deletion is available to every user who created an account.
        </p>
        <ol>
          <li>Open the YMCA Ghana app and sign in.</li>
          <li>Go to Profile, then Settings.</li>
          <li>Choose Delete account.</li>
          <li>Read what will be removed, then confirm.</li>
        </ol>
        <p>
          Deletion happens immediately. You are signed out, and that email and phone
          number can no longer be used to sign in. Uninstalling the app does not delete
          your account.
        </p>
      </LegalSection>

      <LegalSection title="If you cannot open the app">
        <p>
          Send an email from the address on your account to{' '}
          <a href={`mailto:${legalContact.email}?subject=YMCA%20account%20deletion%20request`}>
            {legalContact.email}
          </a>
          . Use the subject line “YMCA account deletion request” and include your full
          name, registered email, phone number, and branch if you know it. You can also
          call {legalContact.phone}. We complete verified email or phone requests within
          14 days.
        </p>
      </LegalSection>

      <LegalSection title="Data that is deleted">
        <p>When your account is deleted we remove:</p>
        <ul>
          <li>Your profile, login credentials, and membership record</li>
          <li>Photos, posts, social links, and other content you uploaded</li>
          <li>Survey answers, messages, and notification history</li>
          <li>App preferences and the device PIN stored on this phone</li>
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
