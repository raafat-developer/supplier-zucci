<template>
  <div style="position:relative;min-height:100vh;display:flex;flex-direction:column;background:#0a0a0a;overflow:hidden">
    <video style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none" autoplay muted loop playsinline src="/uploads/bg-video.mp4" />
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);z-index:1" />
    <!-- Topbar -->
    <div style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;border-bottom:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(8px);background:rgba(0,0,0,0.2)">
      <div style="display:flex;align-items:center;gap:0.5rem">
        <div style="width:2rem;height:2rem;background:#3dda84;border-radius:0.5rem;display:flex;align-items:center;justify-content:center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <span style="color:white;font-weight:700;font-size:0.875rem">Zucci Supplier Connect</span>
      </div>
      <router-link to="/login" style="font-size:0.875rem;color:rgba(255,255,255,0.7);padding:0.375rem 0.875rem;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);text-decoration:none;transition:background 150ms">Sign out</router-link>
    </div>
    <!-- Content -->
    <div style="position:relative;z-index:10;flex:1;padding:2rem;max-width:960px;margin:0 auto;width:100%;box-sizing:border-box">
      <!-- Status header -->
      <div style="display:flex;align-items:flex-start;gap:1.25rem;margin-bottom:1.5rem;padding:1.25rem;border-radius:1rem;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);backdrop-filter:blur(16px);box-shadow:0 4px 24px rgba(0,0,0,0.12)">
        <div style="width:3rem;height:3rem;border-radius:50%;background:rgba(245,158,11,0.25);border:1px solid rgba(245,158,11,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <Clock style="color:#fbbf24;width:1.25rem;height:1.25rem" />
        </div>
        <div style="flex:1">
          <h1 style="font-size:1.25rem;font-weight:700;color:white;margin:0 0 0.25rem">Application Under Review</h1>
          <p style="font-size:0.875rem;color:rgba(255,255,255,0.65);margin:0 0 0.75rem">Your application was received on <strong style="color:white">Jun 14, 2026</strong>. Our team typically reviews applications within <strong style="color:white">2–3 business days</strong>.</p>
          <span style="display:inline-flex;align-items:center;gap:0.375rem;background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.3);border-radius:9999px;padding:0.2rem 0.75rem;font-size:0.75rem;font-weight:700">
            <span style="width:6px;height:6px;border-radius:50%;background:#fbbf24;display:inline-block"></span>Pending Review
          </span>
        </div>
      </div>
      <!-- 2-col grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
        <!-- Left: Checklist + Missing docs -->
        <div style="display:flex;flex-direction:column;gap:1.25rem">
          <div style="border-radius:1rem;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);backdrop-filter:blur(16px);overflow:hidden">
            <div style="padding:0.875rem 1.25rem;border-bottom:1px solid rgba(255,255,255,0.12)">
              <p style="font-size:0.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.5);margin:0">Application Checklist</p>
            </div>
            <div>
              <div v-for="item in checklist" :key="item.label" style="display:flex;align-items:center;gap:0.875rem;padding:0.75rem 1.25rem;border-bottom:1px solid rgba(255,255,255,0.08)">
                <div :style="{width:'1.375rem',height:'1.375rem',borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:item.done?'rgba(61,218,132,0.2)':item.pending?'rgba(245,158,11,0.15)':'rgba(239,68,68,0.15)',border:`1px solid ${item.done?'rgba(61,218,132,0.4)':item.pending?'rgba(245,158,11,0.35)':'rgba(239,68,68,0.35)'}`}">
                  <Check v-if="item.done" style="width:10px;height:10px;color:#3dda84" />
                  <Clock v-else-if="item.pending" style="width:9px;height:9px;color:#fbbf24" />
                  <X v-else style="width:10px;height:10px;color:#ef4444" />
                </div>
                <span :style="{flex:1,fontSize:'0.8125rem',color:item.done?'rgba(255,255,255,0.9)':item.pending?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.55)'}">{{ item.label }}</span>
                <span v-if="item.pending" style="font-size:0.625rem;font-weight:700;color:#fbbf24;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);border-radius:9999px;padding:0.15rem 0.5rem">Pending</span>
              </div>
            </div>
          </div>
          <div style="border-radius:1rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);backdrop-filter:blur(12px);padding:1.25rem">
            <p style="font-size:0.8125rem;font-weight:700;color:#fca5a5;margin:0 0 0.625rem;display:flex;align-items:center;gap:0.5rem">
              <AlertCircle style="width:14px;height:14px;color:#fca5a5" /> Action Required
            </p>
            <p style="font-size:0.8125rem;color:rgba(255,255,255,0.55);margin:0 0 0.875rem">The following documents are missing:</p>
            <ul style="display:flex;flex-direction:column;gap:0.5rem;margin:0;padding:0;list-style:none">
              <li v-for="d in missingDocs" :key="d" style="display:flex;align-items:center;gap:0.5rem;font-size:0.8125rem;color:rgba(255,255,255,0.7)">
                <X style="width:10px;height:10px;flex-shrink:0;color:#fca5a5" /> {{ d }}
              </li>
            </ul>
            <button @click="toast('Opening document upload...')" style="margin-top:1rem;width:100%;padding:0.625rem;border-radius:0.5rem;background:rgba(239,68,68,0.7);color:white;border:none;font-size:0.8125rem;font-weight:600;cursor:pointer">Upload Missing Documents</button>
          </div>
        </div>
        <!-- Right: Timeline + contact -->
        <div style="display:flex;flex-direction:column;gap:1.25rem">
          <div style="border-radius:1rem;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);backdrop-filter:blur(16px);overflow:hidden">
            <div style="padding:0.875rem 1.25rem;border-bottom:1px solid rgba(255,255,255,0.12)">
              <p style="font-size:0.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.5);margin:0">What Happens Next</p>
            </div>
            <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem">
              <div v-for="s in steps" :key="s.n" style="display:flex;gap:1rem;align-items:flex-start">
                <div :style="{width:'1.75rem',height:'1.75rem',borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6875rem',fontWeight:'700',background:s.done?'rgba(61,218,132,0.25)':s.active?'rgba(245,158,11,0.2)':'rgba(255,255,255,0.08)',border:`1px solid ${s.done?'rgba(61,218,132,0.5)':s.active?'rgba(245,158,11,0.4)':'rgba(255,255,255,0.15)'}`,color:s.done?'#3dda84':s.active?'#fbbf24':'rgba(255,255,255,0.4)'}">{{ s.done ? '✓' : s.n }}</div>
                <div style="flex:1;padding-top:0.125rem">
                  <p :style="{fontSize:'0.875rem',fontWeight:'600',margin:'0 0 0.25rem',color:s.done||s.active?'white':'rgba(255,255,255,0.5)'}">{{ s.title }}</p>
                  <p style="font-size:0.8125rem;color:rgba(255,255,255,0.45);margin:0">{{ s.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          <div style="border-radius:1rem;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);backdrop-filter:blur(16px);padding:1.25rem;display:flex;align-items:center;gap:1rem;color:white">
            <img src="https://i.pravatar.cc/150?img=38" style="width:2.75rem;height:2.75rem;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,0.25)" alt="Sara" />
            <div style="flex:1;min-width:0">
              <p style="font-size:0.875rem;font-weight:600;margin:0">Sara Medhat</p>
              <p style="font-size:0.75rem;color:rgba(255,255,255,0.5);margin:0.125rem 0 0">Partnership Manager · Responds in 2h</p>
            </div>
            <div style="display:flex;gap:0.5rem">
              <button @click="toast('Message Sara')" style="width:2.25rem;height:2.25rem;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);cursor:pointer;display:flex;align-items:center;justify-content:center;color:white"><MessageSquare style="width:14px;height:14px" /></button>
              <button @click="toast('Book a call')" style="width:2.25rem;height:2.25rem;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);cursor:pointer;display:flex;align-items:center;justify-content:center;color:white"><Calendar style="width:14px;height:14px" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { Clock, Check, X, AlertCircle, MessageSquare, Calendar } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
const { toast } = useAppStore()
const checklist = [
  { label: 'Personal / Business Information', done: true },
  { label: 'Identity Verification (KYC)', done: true },
  { label: 'Bank Account Details', done: true },
  { label: 'Business Documents', done: false },
  { label: 'Commercial Registration', done: true },
  { label: 'Zucci Review', done: false, pending: true }
]
const missingDocs = ['VAT Certificate', 'Bank Confirmation Letter (USD account)']
const steps = [
  { n: 1, title: 'Documents Verified', desc: 'Our team verifies your submitted documents and KYC information.', done: true },
  { n: 2, title: 'Application Review', desc: 'A Zucci partnerships manager reviews your brand and product range.', active: true },
  { n: 3, title: 'Approval & Onboarding', desc: 'You receive approval and get access to the full supplier dashboard.' },
  { n: 4, title: 'Go Live', desc: 'Your products go live on Zucci markets across AE, SA, EG and more.' }
]
</script>
