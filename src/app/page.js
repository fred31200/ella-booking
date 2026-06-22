'use client'

import { useState, useEffect } from 'react'
import { config } from '@/config'
import { buildCalendarMonth, toISODate } from '@/lib/slots'

const STEPS = ['Soin', 'Date', 'Créneau', 'Coordonnées', 'Récapitulatif']

const DAYS_FR  = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin',
                   'Juillet','Août','Septembre','Octobre','Novembre','Décembre']

export default function BookingPage() {
  const [step,    setStep]    = useState(1)
  const [service, setService] = useState(null)
  const [date,    setDate]    = useState(null)
  const [time,    setTime]    = useState(null)
  const [slots,   setSlots]   = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', notes: '' })
  const [errors,  setErrors]  = useState({})
  const [paying,  setPaying]  = useState(false)

  // Charge les créneaux quand date + service sont définis
  useEffect(() => {
    if (!date || !service) return
    setLoadingSlots(true)
    setTime(null)
    fetch(`/api/slots?date=${date}&duration=${service.duration}`)
      .then(r => r.json())
      .then(d => { setSlots(d.slots || []); setLoadingSlots(false) })
      .catch(() => setLoadingSlots(false))
  }, [date, service])

  const selectService = (s) => { setService(s); setDate(null); setTime(null); setStep(2) }
  const selectDate    = (d) => { setDate(d); setStep(3) }
  const selectTime    = (t) => { setTime(t); setStep(4) }

  const validateForm = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Nom requis'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide'
    if (!form.phone.trim()) e.phone = 'Téléphone requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePay = async () => {
    if (!validateForm()) return
    setPaying(true)
    try {
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId:   service.id,
          serviceName: service.name,
          price:       service.price,
          duration:    service.duration,
          date, time,
          customer: form,
        }),
      })
      const { url, error } = await res.json()
      if (url) window.location.href = url
      else { console.error(error); setPaying(false) }
    } catch { setPaying(false) }
  }

  const formatDate = (d) => {
    if (!d) return ''
    const [y, m, day] = d.split('-')
    return `${parseInt(day)} ${MONTHS_FR[parseInt(m) - 1]} ${y}`
  }

  const calCells = buildCalendarMonth(calMonth.year, calMonth.month)

  const prevMonth = () => setCalMonth(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })
  const nextMonth = () => setCalMonth(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })

  const t = config.theme

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header style={{ background: '#3A1E0E', padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.18em', color: 'rgba(226,184,126,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
          {config.business.tagline}
        </div>
        <div style={{ fontFamily: "'Italiana', serif", fontSize: '1.7rem', color: '#E2B87E', letterSpacing: '0.05em' }}>
          {config.business.name}
        </div>
        <div style={{ marginTop: 4, fontSize: '0.78rem', color: 'rgba(226,184,126,0.5)' }}>
          {config.business.location}
        </div>
      </header>

      {/* ── Barre de progression ───────────────────────── */}
      <div style={{ background: '#EAD9B8', borderBottom: `1px solid ${t.border}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex' }}>
          {STEPS.map((label, i) => {
            const n = i + 1
            const done    = step > n
            const current = step === n
            return (
              <button key={n}
                onClick={() => done && setStep(n)}
                style={{
                  flex: 1, padding: '14px 4px', border: 'none', background: 'transparent',
                  cursor: done ? 'pointer' : 'default', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4,
                }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem',
                  fontWeight: 600,
                  background: done ? t.primary : current ? t.primaryDark : 'transparent',
                  color: (done || current) ? '#F0E6CC' : t.textLight,
                  border: `1.5px solid ${done || current ? 'transparent' : t.border}`,
                  transition: 'all 0.2s',
                }}>
                  {done ? '✓' : n}
                </div>
                <span style={{
                  fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: current ? t.primaryDark : done ? t.primary : t.textLight,
                  fontWeight: current ? 600 : 400,
                }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Contenu principal ──────────────────────────── */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ÉTAPE 1 — Choix du soin */}
        {step === 1 && (
          <div>
            <SectionTitle>Quel soin souhaitez-vous ?</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, marginTop: 24 }}>
              {config.services.map(s => (
                <button key={s.id} onClick={() => selectService(s)}
                  style={{
                    background: '#FBF4E4', border: `1.5px solid ${t.border}`,
                    borderRadius: 4, padding: '20px 22px', textAlign: 'left', cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.background = '#FFF8EC' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border;   e.currentTarget.style.background = '#FBF4E4' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontFamily: "'Italiana', serif", fontSize: '1.15rem', color: t.text }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: t.primary, letterSpacing: '0.04em', marginTop: 2 }}>{s.subtitle}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontFamily: "'Italiana', serif", fontSize: '1.3rem', color: t.primaryDark }}>{s.price} €</div>
                      <div style={{ fontSize: '0.72rem', color: t.textLight }}>{s.duration} min</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: t.textLight, lineHeight: 1.6, marginTop: 8 }}>{s.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Choix de la date */}
        {step === 2 && (
          <div>
            <BackButton onClick={() => setStep(1)} />
            <SectionTitle>Choisissez une date</SectionTitle>
            <ServiceSummary service={service} />
            <div style={{ maxWidth: 360, margin: '24px auto 0', background: '#FBF4E4', border: `1px solid ${t.border}`, borderRadius: 4, padding: '20px' }}>
              {/* Navigation mois */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button onClick={prevMonth} style={navBtnStyle}>‹</button>
                <span style={{ fontFamily: "'Italiana', serif", fontSize: '1.1rem', color: t.text }}>
                  {MONTHS_FR[calMonth.month]} {calMonth.year}
                </span>
                <button onClick={nextMonth} style={navBtnStyle}>›</button>
              </div>
              {/* En-têtes jours */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                {['L','M','M','J','V','S','D'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', color: t.textLight, padding: '4px 0', fontWeight: 600 }}>{d}</div>
                ))}
              </div>
              {/* Grille */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {calCells.map((cell, i) => {
                  if (!cell) return <div key={i} />
                  const isSelected = date === cell.dateStr
                  return (
                    <button key={i} onClick={() => cell.available && selectDate(cell.dateStr)}
                      disabled={!cell.available}
                      style={{
                        padding: '8px 4px', border: 'none', borderRadius: 3, cursor: cell.available ? 'pointer' : 'default',
                        fontSize: '0.85rem', fontWeight: cell.today ? 700 : 400,
                        background: isSelected ? t.primary : cell.today ? 'rgba(196,135,74,0.15)' : 'transparent',
                        color: isSelected ? '#F0E6CC' : cell.available ? t.text : 'rgba(107,76,53,0.3)',
                        textDecoration: cell.past ? 'line-through' : 'none',
                        transition: 'background 0.15s',
                      }}
                    >
                      {cell.day}
                    </button>
                  )
                })}
              </div>
              <div style={{ marginTop: 14, fontSize: '0.72rem', color: t.textLight, textAlign: 'center' }}>
                Lun–Sam · {config.schedule.startHour}h–{config.schedule.endHour}h · Sur rendez-vous
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Choix du créneau */}
        {step === 3 && (
          <div>
            <BackButton onClick={() => setStep(2)} />
            <SectionTitle>Choisissez un créneau</SectionTitle>
            <ServiceSummary service={service} date={date} />
            {loadingSlots ? (
              <div style={{ textAlign: 'center', padding: 40, color: t.textLight }}>Chargement des créneaux…</div>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: t.textLight }}>
                <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>Aucun créneau disponible ce jour.</div>
                <button onClick={() => setStep(2)} style={{ color: t.primary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Choisir une autre date
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10, marginTop: 24 }}>
                {slots.map(slot => (
                  <button key={slot} onClick={() => selectTime(slot)}
                    style={{
                      padding: '12px 8px', border: `1.5px solid ${t.border}`, borderRadius: 4,
                      background: time === slot ? t.primary : '#FBF4E4',
                      color: time === slot ? '#F0E6CC' : t.text,
                      fontFamily: "'Instrument Sans', sans-serif", fontSize: '1rem',
                      cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 4 — Coordonnées */}
        {step === 4 && (
          <div>
            <BackButton onClick={() => setStep(3)} />
            <SectionTitle>Vos coordonnées</SectionTitle>
            <ServiceSummary service={service} date={date} time={time} />
            <div style={{ maxWidth: 480, marginTop: 28 }}>
              {[
                { key: 'name',  label: 'Prénom et nom',   type: 'text',  placeholder: 'Marie Dupont' },
                { key: 'email', label: 'Email',            type: 'email', placeholder: 'marie@exemple.fr' },
                { key: 'phone', label: 'Téléphone',        type: 'tel',   placeholder: '06 XX XX XX XX' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: t.textLight, letterSpacing: '0.05em', marginBottom: 6, textTransform: 'uppercase' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '11px 14px', border: `1.5px solid ${errors[f.key] ? '#c0392b' : t.border}`,
                      borderRadius: 4, fontSize: '0.95rem', background: '#FBF4E4', color: t.text,
                      fontFamily: "'Instrument Sans', sans-serif", outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  {errors[f.key] && <div style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: 4 }}>{errors[f.key]}</div>}
                </div>
              ))}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: t.textLight, letterSpacing: '0.05em', marginBottom: 6, textTransform: 'uppercase' }}>
                  Notes ou demandes particulières (facultatif)
                </label>
                <textarea
                  placeholder="Précisions sur votre état de santé, allergies connues…"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%', padding: '11px 14px', border: `1.5px solid ${t.border}`,
                    borderRadius: 4, fontSize: '0.9rem', background: '#FBF4E4', color: t.text,
                    fontFamily: "'Instrument Sans', sans-serif", outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
              </div>
              <PrimaryButton onClick={() => { if (validateForm()) setStep(5) }}>
                Continuer vers le récapitulatif →
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ÉTAPE 5 — Récapitulatif & paiement */}
        {step === 5 && (
          <div>
            <BackButton onClick={() => setStep(4)} />
            <SectionTitle>Récapitulatif de votre réservation</SectionTitle>
            <div style={{ maxWidth: 480, marginTop: 28 }}>
              <div style={{ background: '#FBF4E4', border: `1.5px solid ${t.border}`, borderRadius: 4, padding: '24px 28px', marginBottom: 20 }}>
                <Row label="Soin"         value={`${service.name} — ${service.subtitle}`} />
                <Row label="Durée"        value={`${service.duration} min`} />
                <Row label="Date"         value={formatDate(date)} />
                <Row label="Heure"        value={time} />
                <Row label="Lieu"         value={config.business.location} />
                <div style={{ height: 1, background: t.border, margin: '14px 0' }} />
                <Row label="Nom"          value={form.name} />
                <Row label="Email"        value={form.email} />
                <Row label="Téléphone"    value={form.phone} />
                {form.notes && <Row label="Notes" value={form.notes} />}
                <div style={{ height: 1, background: t.border, margin: '14px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: "'Italiana', serif", fontSize: '1rem', color: t.text }}>Total</span>
                  <span style={{ fontFamily: "'Italiana', serif", fontSize: '1.6rem', color: t.primaryDark }}>{service.price} €</span>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: t.textLight, lineHeight: 1.7, marginBottom: 24, padding: '12px 16px', background: 'rgba(196,135,74,0.07)', border: `1px solid ${t.border}`, borderLeft: `3px solid ${t.primary}`, borderRadius: 2 }}>
                Le paiement sécurisé est traité par <strong>Stripe</strong>. Vous serez redirigé vers leur page de paiement. Votre réservation est confirmée dès le paiement effectué.
              </div>

              <PrimaryButton onClick={handlePay} disabled={paying}>
                {paying ? 'Redirection vers le paiement…' : `Payer ${service.price} € et confirmer`}
              </PrimaryButton>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

// ── Composants utilitaires ──────────────────────────────────

function SectionTitle({ children }) {
  const t = config.theme
  return (
    <h1 style={{ fontFamily: "'Italiana', serif", fontSize: '1.6rem', color: t.text, marginBottom: 4, fontWeight: 400 }}>
      {children}
    </h1>
  )
}

function ServiceSummary({ service, date, time }) {
  const t = config.theme
  const MONTHS_FR = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']
  const dateLabel = date ? (() => {
    const [y, m, d] = date.split('-')
    return `${parseInt(d)} ${MONTHS_FR[parseInt(m) - 1]} ${y}`
  })() : null

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
      {service && <Tag>{service.name} · {service.price} €</Tag>}
      {dateLabel && <Tag>{dateLabel}</Tag>}
      {time && <Tag>{time}</Tag>}
    </div>
  )
}

function Tag({ children }) {
  const t = config.theme
  return (
    <span style={{ fontSize: '0.78rem', background: 'rgba(196,135,74,0.12)', color: t.primaryDark, padding: '4px 10px', borderRadius: 2, border: `1px solid ${t.border}` }}>
      {children}
    </span>
  )
}

function Row({ label, value }) {
  const t = config.theme
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '5px 0', fontSize: '0.88rem' }}>
      <span style={{ color: t.textLight }}>{label}</span>
      <span style={{ color: t.text, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function PrimaryButton({ onClick, children, disabled }) {
  const t = config.theme
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        width: '100%', padding: '14px 24px', background: disabled ? 'rgba(196,135,74,0.4)' : t.primaryDark,
        color: '#F0E6CC', border: 'none', borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.95rem', fontWeight: 600,
        letterSpacing: '0.04em', transition: 'background 0.2s',
      }}
    >
      {children}
    </button>
  )
}

function BackButton({ onClick }) {
  const t = config.theme
  return (
    <button onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textLight,
               fontSize: '0.82rem', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
      ← Retour
    </button>
  )
}

const navBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem',
  color: '#C4874A', padding: '0 8px', lineHeight: 1,
}
