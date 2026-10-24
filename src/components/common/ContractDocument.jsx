/**
 * Renders the frozen contract snapshot.
 *
 * The snapshot is produced on the server and is exactly what gets hashed and
 * signed, so this component only displays it. It never computes figures and
 * never renders anything the snapshot does not already contain.
 *
 * The company logo and the landlord's signature are deliberately kept out of
 * the snapshot: they are presentation assets served from public/branding and
 * shared by every document, not terms of the agreement. Only the tenant's
 * signature belongs to this particular contract.
 */
function MetaBox({ label, value }) {
  if (!value) return null
  return (
    <div className="rounded-md border border-gray-300 px-3 py-1.5 min-w-36">
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900 break-all">{value}</div>
    </div>
  )
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <dt className="w-28 shrink-0 text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  )
}

function FigureCell({ label, value, emphasized }) {
  return (
    <div className={`p-3 ${emphasized ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className={`text-[10px] uppercase tracking-wider ${emphasized ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </div>
      <div className={`text-sm ${emphasized ? 'font-bold' : 'font-semibold'}`}>{value}</div>
    </div>
  )
}

export default function ContractDocument({
  snapshot,
  branding,
  signature,
  signatureName,
  className = '',
}) {
  if (!snapshot) return null

  const logoUrl = branding?.logo_url
  const ownerSignatureUrl = branding?.signature_url
  // Prefer the name frozen into the snapshot (the owner's own saved setting),
  // so the letterhead matches the clause text inside the same document. The
  // shared branding config is only a fallback for unconfigured owners.
  const companyName = snapshot.company_name || branding?.company_name
  const contact = [branding?.company_address, branding?.company_phone].filter(Boolean).join(' | ')

  const currency = snapshot.currency || 'TZS'
  const fmt = (v) => `${currency} ${(Number(v) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  const figures = snapshot.figures || {}
  const figureItems = [
    ['Kodi / mwezi', fmt(figures.rent_amount)],
    ['Kodi / siku', fmt(figures.daily_rate)],
    ['Overstay / siku', fmt(figures.notice_per_day)],
    ['Malipo kufikia siku', String(Number(figures.due_day) || 25)],
    ['Muda', `${Number(figures.period_months) || 1} miezi`],
  ]
  if (Number(figures.deposit_amount) > 0) figureItems.push(['Deposit', fmt(figures.deposit_amount)])
  if (Number(figures.service_fee) > 0) figureItems.push(['Service fee (mwezi)', fmt(figures.service_fee)])

  return (
    <article className={`bg-white text-gray-900 leading-relaxed font-serif text-[15px] ${className}`}>
      {/* Letterhead */}
      <header className="text-center border-b-4 border-double border-gray-900 pb-5 mb-6">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${companyName} logo`}
            className="mx-auto mb-3 max-h-20 max-w-40 object-contain"
          />
        )}
        {companyName && (
          <div className="text-2xl font-bold tracking-[0.3em] uppercase font-sans">{companyName}</div>
        )}
        <h1 className="text-base font-semibold mt-1 font-sans">{snapshot.title}</h1>
        {snapshot.property?.house && (
          <p className="text-xs text-gray-600 mt-1 font-sans">
            {snapshot.property.house}
            {snapshot.property.room ? ` - Sebule ${snapshot.property.room}` : ''}
            {snapshot.property.address ? ` - ${snapshot.property.address}` : ''}
          </p>
        )}
        {contact && <p className="text-xs text-gray-600 mt-1 font-sans">{contact}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 font-sans">
          <MetaBox label="Na. Mkatataba" value={snapshot.contract_number} />
          <MetaBox label="Kuanzia" value={snapshot.start_date} />
          <MetaBox label="Kuisha" value={snapshot.end_date} />
        </div>
      </header>

      {/* Parties */}
      {snapshot.tenant && (
        <section className="mb-6 overflow-hidden rounded-md border border-gray-300">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="border-b border-gray-200 p-4 sm:border-b-0 sm:border-r">
              <h2 className="mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500">
                Mwakariri / Tenant
              </h2>
              <dl className="space-y-1">
                <DetailRow label="Jina" value={snapshot.tenant.full_name} />
                <DetailRow label="Simu" value={snapshot.tenant.phone} />
                <DetailRow label="Kitambulisho" value={snapshot.tenant.id_number} />
              </dl>
            </div>
            <div className="p-4">
              <h2 className="mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500">
                Eneo la Pango / Premise
              </h2>
              <dl className="space-y-1">
                <DetailRow label="Jengo" value={snapshot.property?.house} />
                <DetailRow label="Chumba" value={snapshot.property?.room} />
                <DetailRow label="Anwani" value={snapshot.property?.address} />
              </dl>
            </div>
          </div>
        </section>
      )}

      <p className="font-medium">{snapshot.salutation}</p>

      <p className="mt-3 text-justify">{snapshot.preamble}</p>

      <p className="mt-3 text-justify">{snapshot.period_line}</p>

      {/* Figures the tenant can check against the money actually paid */}
      {snapshot.figures && (
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 border-b-2 border-gray-900 pb-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
            <span className="inline-block h-2 w-2 rotate-45 bg-gray-900" />
            Muhtasari wa Fedha / Summary of Figures
          </h2>
          <div className="grid grid-cols-2 overflow-hidden rounded-md border border-gray-300 sm:grid-cols-4">
            {figureItems.map(([label, value]) => (
              <FigureCell key={label} label={label} value={value} />
            ))}
            <FigureCell label="Jumla / Total" value={fmt(figures.total_amount)} emphasized />
          </div>
        </section>
      )}

      {/* Terms */}
      <section className="mt-6">
        <h2 className="mb-4 flex items-center gap-2 border-b-2 border-gray-900 pb-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
          <span className="inline-block h-2 w-2 rotate-45 bg-gray-900" />
          {snapshot.conditions_heading}
        </h2>
        <ol className="space-y-3">
          {(snapshot.clauses || []).map((clause) => (
            <li key={clause.number} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 font-sans text-xs font-bold text-white">
                {clause.number}
              </span>
              <span className="text-justify">{clause.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Owner's own terms */}
      {snapshot.description && (
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 border-b-2 border-gray-900 pb-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
            <span className="inline-block h-2 w-2 rotate-45 bg-gray-900" />
            {snapshot.additional_heading}
          </h2>
          <div className="space-y-2 whitespace-pre-line text-justify">{snapshot.description}</div>
        </section>
      )}

      <p className="mt-8 border-t border-gray-200 pt-6 text-center italic">{snapshot.welcome}</p>

      {/* Signatures. The landlord's signature is the shared company stamp from
          public/branding; only the right-hand block is this contract's own. */}
      <section className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="text-center">
          <div className="min-h-16 flex items-end justify-center">
            {ownerSignatureUrl ? (
              <img
                src={ownerSignatureUrl}
                alt={`Saini ya ${companyName}`}
                className="max-h-16 max-w-48 object-contain"
              />
            ) : (
              <div className="w-full max-w-48 border-t-2 border-gray-900" />
            )}
          </div>
          <div className="mt-1 font-semibold text-sm font-sans">{companyName}</div>
          <div className="text-xs text-gray-600 font-sans">Mwenyewe / Landlord</div>
        </div>

        <div className="text-center">
          <div className="min-h-16 flex items-end justify-center">
            {signature ? (
              <img
                src={signature}
                alt="Saini ya mkatataba"
                className="max-h-16 object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full max-w-48 border-t-2 border-gray-900" />
            )}
          </div>
          <div className="mt-1 font-semibold text-sm font-sans">
            {signatureName || snapshot.tenant?.full_name}
          </div>
          <div className="text-xs text-gray-600 font-sans">Mwakariri / Tenant</div>
        </div>
      </section>
    </article>
  )
}