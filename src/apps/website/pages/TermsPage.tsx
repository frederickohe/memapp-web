import { Link } from 'react-router-dom'
import { legalContact, legalPaths } from '../../../config/legal'
import { LegalPage, LegalSection, legalStyles } from './LegalPage'

export function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="13 September 2026">
      <LegalSection title="Agreement">
        <p>
          These terms govern use of the YMCA Ghana Member App, the public website, the
          admin portal, and the e-learning portal. By creating an account or using the
          services you agree to these terms and our{' '}
          <Link to={legalPaths.privacy}>Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="The service">
        <p>
          The app is provided by {legalContact.operator} for {legalContact.organisation} so
          members can register, renew membership, pay dues, receive updates, record
          volunteer hours, and access learning content. Features may change as YMCA Ghana
          expands the programme.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <ul>
          <li>You must provide accurate registration details and keep your password confidential.</li>
          <li>You are responsible for activity on your account.</li>
          <li>Membership approval, branch assignment, and access levels are controlled by YMCA Ghana administrators.</li>
          <li>We may suspend or close an account that is used unlawfully, shared, or used to harm other members.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Payments">
        <p>
          Dues, renewals, and donations are processed by our payment partners. Successful
          payments are recorded against your membership. Refunds, if any, follow YMCA
          Ghana&apos;s finance policy for that payment type.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          Do not misuse the app, post unlawful or abusive content, attempt to access
          another member&apos;s account, or interfere with the service. Content you submit
          (for example profile or social posts) must be lawful and respectful.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          The service is provided to support YMCA Ghana membership operations. To the
          extent permitted by law, {legalContact.operator} and {legalContact.organisation}{' '}
          are not liable for indirect or consequential loss, or for outages caused by
          networks, devices, or third-party payment services.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms as the app changes. The updated date at the top of
          this page is the effective date. Continued use after a change means you accept
          the revised terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions: <a href={`mailto:${legalContact.email}`}>{legalContact.email}</a>
          . Phone {legalContact.phone}.
        </p>
      </LegalSection>

      <div className={legalStyles.cta}>
        <p>Related documents</p>
        <p>
          <Link to={legalPaths.privacy}>Privacy policy</Link>
          {' · '}
          <Link to={legalPaths.accountDeletion}>Account deletion</Link>
        </p>
      </div>
    </LegalPage>
  )
}
