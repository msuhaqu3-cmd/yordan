import { requireUser } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";
import ActionForm from "@/components/admin/action-form";
import { saveSettingsAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser();
  const s = await loadSettings();
  return (
    <>
      <h1>Company info</h1>
      <p className="sub">Shown on the website, the legal pages and the mobile app (phone buttons, WhatsApp links, address, TikTok).</p>
      <div className="card">
        <ActionForm action={saveSettingsAction}>
          <div className="cols">
            <label className="field"><span>Phone number</span><input name="phone" defaultValue={s.phone} required inputMode="tel" maxLength={20} /></label>
            <label className="field"><span>WhatsApp number</span><input name="whatsapp" defaultValue={s.whatsapp} required inputMode="tel" maxLength={20} /></label>
            <label className="field"><span>Contact email (shown on site)</span><input name="email" type="email" defaultValue={s.email} required maxLength={120} /></label>
            <label className="field"><span>TikTok handle</span><input name="tiktok" defaultValue={s.tiktok} required maxLength={41} /></label>
            <label className="field"><span>Address line</span><input name="address1" defaultValue={s.address1} required maxLength={80} /></label>
            <label className="field"><span>Town / city</span><input name="city" defaultValue={s.city} required maxLength={80} /></label>
            <label className="field"><span>Postcode</span><input name="postcode" defaultValue={s.postcode} required maxLength={9} /></label>
          </div>
        </ActionForm>
      </div>
      <div className="notice">
        <b>About quote notifications.</b> New quote requests are still emailed (via FormSubmit) and sent through WhatsApp / SMS exactly as before.
        Changing the contact email above only changes what visitors see. The inbox that receives website quote emails is configured separately
        and must be activated with FormSubmit, so it is not editable here.
      </div>
    </>
  );
}
