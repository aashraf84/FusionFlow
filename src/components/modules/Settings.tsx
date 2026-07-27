"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Settings as SettingsIcon, Building2, MonitorSmartphone, ChefHat, Percent, Receipt,
  Bell, Plug, Shield, Palette, Database, Globe, Save, Download, Upload, Check,
  CreditCard, MessageCircle, Mail, Smartphone, Printer, Clock, Lock, Eye, EyeOff,
} from "lucide-react"
import { toast } from "sonner"

export function SettingsModule() {
  const [tab, setTab] = useState("company")

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto pf-scroll pb-1">
          <TabsList className="h-auto bg-muted/50 p-1">
            {[
              { id: "company", label: "Company", icon: Building2 },
              { id: "pos", label: "POS & Billing", icon: MonitorSmartphone },
              { id: "kitchen", label: "Kitchen", icon: ChefHat },
              { id: "tax", label: "Tax & Finance", icon: Percent },
              { id: "receipt", label: "Receipt", icon: Receipt },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "integrations", label: "Integrations", icon: Plug },
              { id: "security", label: "Security", icon: Shield },
              { id: "appearance", label: "Appearance", icon: Palette },
              { id: "system", label: "System", icon: Database },
            ].map(t => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs gap-1.5 px-3 py-1.5">
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="company" className="mt-4"><CompanySettings /></TabsContent>
        <TabsContent value="pos" className="mt-4"><POSSettings /></TabsContent>
        <TabsContent value="kitchen" className="mt-4"><KitchenSettings /></TabsContent>
        <TabsContent value="tax" className="mt-4"><TaxSettings /></TabsContent>
        <TabsContent value="receipt" className="mt-4"><ReceiptSettings /></TabsContent>
        <TabsContent value="notifications" className="mt-4"><NotificationSettings /></TabsContent>
        <TabsContent value="integrations" className="mt-4"><IntegrationSettings /></TabsContent>
        <TabsContent value="security" className="mt-4"><SecuritySettings /></TabsContent>
        <TabsContent value="appearance" className="mt-4"><AppearanceSettings /></TabsContent>
        <TabsContent value="system" className="mt-4"><SystemSettings /></TabsContent>
      </Tabs>
    </div>
  )
}

// ── Shared setting components ──
function SettingCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-bold text-sm">{title}</h3>
        {desc && <p className="text-[11px] text-muted-foreground">{desc}</p>}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </Card>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

function ToggleRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn)
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold">{label}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  )
}

function SaveBar({ onSave }: { onSave?: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <Button variant="outline" size="sm">Reset</Button>
      <Button size="sm" onClick={() => { onSave?.(); toast.success("Settings saved successfully") }}>
        <Save className="h-3.5 w-3.5 mr-1.5" /> Save Changes
      </Button>
    </div>
  )
}

// ── Company Settings ──
function CompanySettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="Company Profile" desc="Basic company information used across the ERP">
        <Field label="Company Name"><Input defaultValue="FusionFlow Restaurant Group" /></Field>
        <Field label="Legal Name"><Input defaultValue="FusionFlow Foods (Pvt) Ltd." /></Field>
        <Field label="Industry">
          <Select defaultValue="qsr">
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="qsr">Quick Service Restaurant</SelectItem>
              <SelectItem value="dine_in">Dine-in Restaurant</SelectItem>
              <SelectItem value="cloud">Cloud Kitchen</SelectItem>
              <SelectItem value="franchise">Franchise Chain</SelectItem>
              <SelectItem value="cafe">Café & Bakery</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Founded Year"><Input defaultValue="2023" /></Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Contact & Address" desc="Registered office address and contact">
        <Field label="Head Office Address"><Textarea defaultValue="123-G Gulberg III, Lahore, Punjab, Pakistan" className="h-16 resize-none" /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="City"><Input defaultValue="Lahore" /></Field>
          <Field label="Province"><Input defaultValue="Punjab" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Phone"><Input defaultValue="+92 42 3578 1111" /></Field>
          <Field label="Email"><Input defaultValue="info@fusionflow.dev" /></Field>
        </div>
        <Field label="Website"><Input defaultValue="www.fusionflow.dev" /></Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Tax Registration" desc="Government tax registration numbers">
        <Field label="NTN (National Tax Number)"><Input defaultValue="1234567-8" /></Field>
        <Field label="STRN (Sales Tax Registration)"><Input defaultValue="3217654-0987654-1" /></Field>
        <Field label="Tax Filing Frequency">
          <Select defaultValue="monthly">
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Regional & Localization" desc="Currency, timezone and language">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Currency">
            <Select defaultValue="pkr">
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pkr">PKR — Pakistani Rupee</SelectItem>
                <SelectItem value="usd">USD — US Dollar</SelectItem>
                <SelectItem value="aed">AED — UAE Dirham</SelectItem>
                <SelectItem value="sar">SAR — Saudi Riyal</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Timezone">
            <Select defaultValue="pst">
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pst">Asia/Karachi (PKT)</SelectItem>
                <SelectItem value="dubai">Asia/Dubai (GST)</SelectItem>
                <SelectItem value="riyadh">Asia/Riyadh (AST)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Language"><Select defaultValue="en"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ur">Urdu</SelectItem><SelectItem value="ar">Arabic</SelectItem></SelectContent></Select></Field>
          <Field label="Date Format"><Select defaultValue="dmy"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dmy">DD/MM/YYYY</SelectItem><SelectItem value="mdy">MM/DD/YYYY</SelectItem><SelectItem value="ymd">YYYY-MM-DD</SelectItem></SelectContent></Select></Field>
        </div>
        <SaveBar />
      </SettingCard>
    </div>
  )
}

// ── POS Settings ──
function POSSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="POS Configuration" desc="Point of sale terminal behavior">
        <ToggleRow label="Auto-logout (idle)" desc="Logout cashier after 5 min inactivity" defaultOn />
        <ToggleRow label="Quick keys" desc="Enable keyboard shortcuts (F1-F12)" defaultOn />
        <ToggleRow label="Barcode scanner" desc="Listen for USB barcode input" defaultOn />
        <ToggleRow label="Customer display" desc="Show order on secondary customer display" defaultOn />
        <ToggleRow label="Cash drawer auto-open" desc="Open drawer on cash payment" defaultOn />
        <ToggleRow label="Round to nearest" desc="Round totals to nearest Rs 1" />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Order Types" desc="Enabled order fulfillment types">
        <ToggleRow label="Dine-In" desc="Table service orders" defaultOn />
        <ToggleRow label="Takeaway" desc="Counter pickup orders" defaultOn />
        <ToggleRow label="Delivery" desc="Rider-delivered orders" defaultOn />
        <ToggleRow label="Drive-Thru" desc="Vehicle pickup window" />
        <ToggleRow label="Online ordering" desc="Web & app orders" defaultOn />
        <ToggleRow label="QR ordering" desc="Scan-to-order at tables" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Payment Methods" desc="Accepted payment options">
        <ToggleRow label="Cash" desc="Accept cash payments" defaultOn />
        <ToggleRow label="Card (Credit/Debit)" desc="Visa, Mastercard, UnionPay" defaultOn />
        <ToggleRow label="Digital Wallet" desc="JazzCash, EasyPaisa, Sadapay" defaultOn />
        <ToggleRow label="Bank Transfer" desc="IBAN/RAAST transfer" />
        <ToggleRow label="Mixed Payment" desc="Split across multiple methods" defaultOn />
        <ToggleRow label="Gift Cards" desc="Redeem gift card balances" />
        <ToggleRow label="Loyalty Points" desc="Pay with points" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Billing & Invoicing" desc="Invoice numbering and billing rules">
        <Field label="Invoice Prefix"><Input defaultValue="INV-" /></Field>
        <Field label="Starting Number"><Input defaultValue="1001" /></Field>
        <Field label="Invoice Footer Note"><Textarea defaultValue="Thank you for dining with FusionFlow!" className="h-12 resize-none" /></Field>
        <ToggleRow label="Print receipt automatically" desc="Print after each order" defaultOn />
        <ToggleRow label="Email receipt" desc="Send receipt to customer email" />
        <ToggleRow label="SMS receipt link" desc="Send receipt link via SMS" />
        <SaveBar />
      </SettingCard>
    </div>
  )
}

// ── Kitchen Settings ──
function KitchenSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="Kitchen Display" desc="KDS behavior and display options">
        <ToggleRow label="Sound alerts" desc="Play beep on new order" defaultOn />
        <ToggleRow label="Color-coded status" desc="Green=ready, Amber=prep, Red=overdue" defaultOn />
        <ToggleRow label="Show prep timer" desc="Countdown on each ticket" defaultOn />
        <ToggleRow label="Auto-bump completed" desc="Remove ready orders after 30s" />
        <Field label="Overdue threshold (minutes)"><Input type="number" defaultValue="10" /></Field>
        <Field label="Font size">
          <Select defaultValue="md"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sm">Small</SelectItem><SelectItem value="md">Medium</SelectItem><SelectItem value="lg">Large</SelectItem><SelectItem value="xl">Extra Large</SelectItem></SelectContent></Select>
        </Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Kitchen Stations" desc="Active prep stations">
        <ToggleRow label="Pizza Station" desc="Pizza oven and prep" defaultOn />
        <ToggleRow label="Burger & Grill" desc="Grill and flat-top" defaultOn />
        <ToggleRow label="Fry Station" desc="Deep fryers" defaultOn />
        <ToggleRow label="Drinks" desc="Beverages and shakes" defaultOn />
        <ToggleRow label="Dessert" desc="Desserts and ice cream" defaultOn />
        <ToggleRow label="Salad & Cold" desc="Cold prep and salads" />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Production & Prep" desc="Batch production settings">
        <ToggleRow label="Auto-generate daily prep plan" desc="Create batches at 6 AM" defaultOn />
        <ToggleRow label="Track yield %" desc="Record production yield" defaultOn />
        <ToggleRow label="Expiry alerts" desc="Notify before batch expiry" defaultOn />
        <Field label="Default dough batch size"><Input defaultValue="120 pcs" /></Field>
        <Field label="Sauce batch frequency">
          <Select defaultValue="daily"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="2day">Every 2 days</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent></Select>
        </Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Waste Tracking" desc="Food waste monitoring">
        <ToggleRow label="Log waste on every batch" desc="Prompt for waste quantity" defaultOn />
        <ToggleRow label="Waste reason required" desc="Must specify reason" />
        <Field label="Waste target %"><Input type="number" defaultValue="5" /></Field>
        <Field label="Alert threshold %"><Input type="number" defaultValue="8" /></Field>
        <SaveBar />
      </SettingCard>
    </div>
  )
}

// ── Tax Settings ──
function TaxSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="Sales Tax (GST)" desc="Goods and Services Tax configuration">
        <Field label="Standard GST Rate %"><Input type="number" defaultValue="13" /></Field>
        <Field label="Reduced Rate %"><Input type="number" defaultValue="5" /></Field>
        <Field label="Zero-rated items"><Input defaultValue="Export orders, basic groceries" /></Field>
        <ToggleRow label="Tax-inclusive pricing" desc="Prices include GST" />
        <ToggleRow label="Show tax breakdown on receipt" desc="Display GST line item" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Income Tax" desc="Corporate income tax settings">
        <Field label="Corporate Tax Rate %"><Input type="number" defaultValue="25" /></Field>
        <Field label="Tax Year">
          <Select defaultValue="jul"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="jul">Jul-Jun (Pakistan fiscal)</SelectItem><SelectItem value="jan">Jan-Dec (Calendar)</SelectItem><SelectItem value="apr">Apr-Mar (UK fiscal)</SelectItem></SelectContent></Select>
        </Field>
        <ToggleRow label="Auto-calculate quarterly estimates" desc="Generate quarterly tax estimates" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Payroll Taxes" desc="Employee tax deductions">
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase text-muted-foreground">Income Tax Slabs (Monthly)</div>
          {[
            { range: "Up to Rs 50,000", rate: "0%" },
            { range: "Rs 50,001 — 100,000", rate: "10%" },
            { range: "Rs 100,001 — 200,000", rate: "20%" },
            { range: "Above Rs 200,000", rate: "30%" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input defaultValue={s.range} className="h-8 text-xs flex-1" />
              <Input defaultValue={s.rate} className="h-8 text-xs w-20" />
            </div>
          ))}
        </div>
        <Field label="EOBI Contribution %"><Input type="number" defaultValue="2" /></Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Withholding Tax" desc="Supplier withholding tax">
        <Field label="WHT on Services %"><Input type="number" defaultValue="8" /></Field>
        <Field label="WHT on Goods %"><Input type="number" defaultValue="4" /></Field>
        <ToggleRow label="Auto-deduct WHT on vendor payments" desc="Withhold tax on AP payments" defaultOn />
        <SaveBar />
      </SettingCard>
    </div>
  )
}

// ── Receipt Settings ──
function ReceiptSettings() {
  const [showPreview, setShowPreview] = useState(false)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="Receipt Format" desc="Thermal receipt configuration (80mm)">
        <Field label="Receipt Width">
          <Select defaultValue="80"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="58">58mm (mini)</SelectItem><SelectItem value="80">80mm (standard)</SelectItem><SelectItem value="112">112mm (wide)</SelectItem></SelectContent></Select>
        </Field>
        <Field label="Font Size">
          <Select defaultValue="sm"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="xs">Extra Small</SelectItem><SelectItem value="sm">Small</SelectItem><SelectItem value="md">Medium</SelectItem></SelectContent></Select>
        </Field>
        <ToggleRow label="Show barcode" desc="Print order number barcode" defaultOn />
        <ToggleRow label="Show QR code" desc="Print reorder QR code" />
        <ToggleRow label="Show cashier name" desc="Display cashier on receipt" defaultOn />
        <ToggleRow label="Show customer name" desc="Display customer" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Receipt Content" desc="Header and footer text">
        <Field label="Header — Line 1"><Input defaultValue="FusionFlow" /></Field>
        <Field label="Header — Line 2"><Input defaultValue="Restaurant & Pizza" /></Field>
        <Field label="Header — Line 3"><Input defaultValue="Gulberg III, Lahore" /></Field>
        <Field label="Footer — Line 1"><Input defaultValue="Thank you for dining with us!" /></Field>
        <Field label="Footer — Line 2"><Input defaultValue="Please come again" /></Field>
        <Field label="Footer — Line 3"><Input defaultValue="www.fusionflow.dev" /></Field>
        <Field label="Help Contact"><Input defaultValue="For queries: +92 300 0000000" /></Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Printer Configuration" desc="Hardware printer settings">
        <Field label="Default Printer">
          <Select defaultValue="auto"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="auto">Auto-detect</SelectItem><SelectItem value="epson">Epson TM-T82</SelectItem><SelectItem value="star">Star TSP143</SelectItem><SelectItem value="bixolon">Bixolon SRP-350</SelectItem><SelectItem value="xprinter">XPrinter XP-58</SelectItem></SelectContent></Select>
        </Field>
        <ToggleRow label="Auto-cut after print" desc="Auto-cut paper" defaultOn />
        <ToggleRow label="Cash drawer kick" desc="Open drawer on print" defaultOn />
        <ToggleRow label="Print kitchen copy" desc="Send order to KDS printer" defaultOn />
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Test receipt sent to printer")}>
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Test Receipt
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(s => !s)}>
            <Eye className="h-3.5 w-3.5 mr-1.5" /> {showPreview ? "Hide" : "Preview"}
          </Button>
        </div>
      </SettingCard>

      {showPreview && (
        <SettingCard title="Receipt Preview" desc="80mm thermal receipt preview">
          <div className="bg-white text-black rounded-lg p-3 mx-auto" style={{ width: "100%", maxWidth: "80mm", fontFamily: "'Courier New', monospace", fontSize: "10px", lineHeight: 1.4 }}>
            <div className="text-center">
              <div className="font-extrabold text-sm">FusionFlow</div>
              <div>Restaurant & Pizza</div>
              <div>Gulberg III, Lahore</div>
              <div className="text-[8px]">NTN: 1234567-8</div>
            </div>
            <div style={{ borderTop: "1px dashed #000" }} className="my-1" />
            <div className="text-center font-bold">TAX INVOICE</div>
            <div style={{ borderTop: "1px dashed #000" }} className="my-1" />
            <div className="flex justify-between"><span>Invoice #:</span><span>INV-1234</span></div>
            <div className="flex justify-between"><span>Date:</span><span>25 Jul 2025</span></div>
            <div style={{ borderTop: "1px dashed #000" }} className="my-1" />
            <div className="flex justify-between"><span>Crispy Chicken Burger</span><span>Rs 690</span></div>
            <div style={{ borderTop: "1px dashed #000" }} className="my-1" />
            <div className="flex justify-between"><span>Subtotal:</span><span>Rs 690</span></div>
            <div className="flex justify-between"><span>GST (13%):</span><span>Rs 90</span></div>
            <div className="flex justify-between font-bold text-sm"><span>TOTAL:</span><span>Rs 780</span></div>
            <div style={{ borderTop: "1px dashed #000" }} className="my-1" />
            <div className="text-center text-[8px]">Thank you for dining with us!</div>
          </div>
        </SettingCard>
      )}
    </div>
  )
}

// ── Notification Settings ──
function NotificationSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="Order Notifications" desc="Alerts for order events">
        <ToggleRow label="New order received" desc="Alert on new POS/online order" defaultOn />
        <ToggleRow label="Order ready" desc="Notify when KDS marks ready" defaultOn />
        <ToggleRow label="Order delayed" desc="Alert if prep exceeds threshold" defaultOn />
        <ToggleRow label="Order cancelled" desc="Notify on cancellation" defaultOn />
        <ToggleRow label="Low stock alert" desc="Notify when item below minimum" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Delivery Notifications" desc="Rider and delivery alerts">
        <ToggleRow label="Rider assigned" desc="Notify customer of rider assignment" defaultOn />
        <ToggleRow label="Out for delivery" desc="Notify customer on dispatch" defaultOn />
        <ToggleRow label="Delivery completed" desc="Confirm delivery with OTP" defaultOn />
        <ToggleRow label="Rider offline" desc="Alert if rider goes offline" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Financial Alerts" desc="Money-related notifications">
        <ToggleRow label="Daily sales summary" desc="Email daily sales at closing" defaultOn />
        <ToggleRow label="Low cash drawer" desc="Alert when drawer below minimum" />
        <ToggleRow label="Invoice overdue" desc="Alert on overdue AR" defaultOn />
        <ToggleRow label="Tax filing reminder" desc="Remind before GST due date" defaultOn />
        <ToggleRow label="Budget overrun" desc="Alert when actual exceeds budget" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Notification Channels" desc="How alerts are delivered">
        <ToggleRow label="In-app notifications" desc="Show in the topbar bell" defaultOn />
        <ToggleRow label="Email alerts" desc="Send to registered email" defaultOn />
        <ToggleRow label="SMS alerts" desc="Send via SMS gateway" />
        <ToggleRow label="WhatsApp alerts" desc="Send via WhatsApp Business" defaultOn />
        <ToggleRow label="Push notifications" desc="Mobile app push" defaultOn />
        <Field label="Quiet hours"><div className="flex items-center gap-2"><Input type="time" defaultValue="23:00" className="h-9" /><span className="text-xs">to</span><Input type="time" defaultValue="07:00" className="h-9" /></div></Field>
        <SaveBar />
      </SettingCard>
    </div>
  )
}

// ── Integration Settings ──
function IntegrationSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="Payment Gateways" desc="Online payment processing">
        <IntegrationRow icon={CreditCard} name="JazzCash" status="connected" desc="Mobile wallet payments" />
        <IntegrationRow icon={CreditCard} name="EasyPaisa" status="connected" desc="Telenor wallet" />
        <IntegrationRow icon={CreditCard} name="Stripe" status="disconnected" desc="International cards" />
        <IntegrationRow icon={CreditCard} name="2Checkout" status="disconnected" desc="Global gateway" />
        <IntegrationRow icon={CreditCard} name="RAAST" status="connected" desc="Instant bank transfer" />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Communication" desc="Messaging platforms">
        <IntegrationRow icon={MessageCircle} name="WhatsApp Business" status="connected" desc="Customer messaging" />
        <IntegrationRow icon={Mail} name="Email (SMTP)" status="connected" desc="Transactional emails" />
        <IntegrationRow icon={Smartphone} name="SMS Gateway" status="connected" desc="Bulk SMS (Jazz)" />
        <IntegrationRow icon={Bell} name="Firebase Push" status="disconnected" desc="Mobile push notifications" />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Delivery Aggregators" desc="Third-party delivery platforms">
        <IntegrationRow icon={Bike} name="Foodpanda" status="connected" desc="Order aggregation" />
        <IntegrationRow icon={Bike} name="Uber Eats" status="disconnected" desc="Order aggregation" />
        <IntegrationRow icon={Bike} name="Careem DineOut" status="disconnected" desc="Order aggregation" />
        <IntegrationRow icon={Bike} name="Talabat" status="disconnected" desc="Middle East delivery" />
        <IntegrationRow icon={Bike} name="Cheetay" status="connected" desc="Local delivery" />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Maps & Logistics" desc="Location services">
        <IntegrationRow icon={Globe} name="Google Maps API" status="connected" desc="Rider navigation & geocoding" />
        <IntegrationRow icon={Globe} name="Apple Maps" status="disconnected" desc="iOS navigation" />
        <IntegrationRow icon={Globe} name="Mapbox" status="disconnected" desc="Custom map styling" />
        <Field label="Google Maps API Key"><Input type="password" defaultValue="AIzaSyXXXXXXXXXXXXXXX" /></Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Accounting & ERP" desc="External accounting integrations">
        <IntegrationRow icon={Database} name="QuickBooks" status="disconnected" desc="Sync invoices & expenses" />
        <IntegrationRow icon={Database} name="Xero" status="disconnected" desc="Cloud accounting" />
        <IntegrationRow icon={Database} name="SAP" status="disconnected" desc="Enterprise ERP" />
        <IntegrationRow icon={Database} name="Tally" status="connected" desc="Local accounting sync" />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Hardware" desc="POS hardware integrations">
        <IntegrationRow icon={Printer} name="Thermal Printer" status="connected" desc="Epson TM-T82II" />
        <IntegrationRow icon={Printer} name="Kitchen Printer" status="connected" desc="Star SP700" />
        <IntegrationRow icon={CreditCard} name="Card Terminal" status="connected" desc="Ingenico ICT220" />
        <IntegrationRow icon={Lock} name="Biometric Scanner" status="disconnected" desc="Staff attendance" />
        <IntegrationRow icon={Database} name="Barcode Scanner" status="connected" desc="Honeywell 1250g" />
        <SaveBar />
      </SettingCard>
    </div>
  )
}

function IntegrationRow({ icon: Icon, name, status, desc }: { icon: typeof CreditCard; name: string; status: "connected" | "disconnected"; desc: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b last:border-0">
      <div className={cn("grid place-items-center h-9 w-9 rounded-lg shrink-0", status === "connected" ? "bg-chart-3/15 text-chart-3" : "bg-muted text-muted-foreground")}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold">{name}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </div>
      <Badge variant="outline" className={cn("text-[9px]", status === "connected" ? "text-chart-3 border-chart-3/30" : "text-muted-foreground")}>
        {status === "connected" ? <><Check className="h-2.5 w-2.5 mr-0.5" />Connected</> : "Disconnected"}
      </Badge>
      <Button size="sm" variant="outline" className="h-7 text-[10px] shrink-0">
        {status === "connected" ? "Configure" : "Connect"}
      </Button>
    </div>
  )
}

// ── Security Settings ──
function SecuritySettings() {
  const [showKey, setShowKey] = useState(false)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="Authentication" desc="Login and access security">
        <ToggleRow label="Two-Factor Authentication (2FA)" desc="Require OTP on login" defaultOn />
        <ToggleRow label="Single Sign-On (SSO)" desc="SAML/OAuth integration" />
        <ToggleRow label="Biometric login" desc="Fingerprint/Face ID" />
        <Field label="Session timeout (minutes)"><Input type="number" defaultValue="30" /></Field>
        <Field label="Password min length"><Input type="number" defaultValue="8" /></Field>
        <ToggleRow label="Password complexity" desc="Require upper, lower, number, symbol" defaultOn />
        <ToggleRow label="Password expiry (90 days)" desc="Force password change" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Access Control" desc="IP and device restrictions">
        <ToggleRow label="IP whitelist" desc="Restrict access to office IPs" />
        <Field label="Allowed IP addresses"><Textarea defaultValue="203.135.0.0/16&#10;182.176.0.0/16" className="h-16 resize-none" /></Field>
        <ToggleRow label="Device registration" desc="Require device approval" defaultOn />
        <ToggleRow label="Max devices per user" desc="Limit concurrent logins" defaultOn />
        <Field label="Max sessions per user"><Input type="number" defaultValue="2" /></Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Audit & Compliance" desc="Activity logging">
        <ToggleRow label="Audit log" desc="Log all user actions" defaultOn />
        <ToggleRow label="Login history" desc="Record all login attempts" defaultOn />
        <ToggleRow label="Data export log" desc="Log all data exports" defaultOn />
        <Field label="Log retention (days)"><Input type="number" defaultValue="365" /></Field>
        <ToggleRow label="GDPR compliance mode" desc="Enable data subject rights" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="API & Developer" desc="API access and keys">
        <Field label="API Key">
          <div className="relative">
            <Input type={showKey ? "text" : "password"} defaultValue="ff_live_sk_7H3k9x2a8N4p" className="pr-9 font-mono" readOnly />
            <button onClick={() => setShowKey(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Field label="Webhook URL"><Input defaultValue="https://api.fusionflow.dev/webhooks" /></Field>
        <ToggleRow label="Rate limiting" desc="1000 req/min per key" defaultOn />
        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => toast.success("API key regenerated")}>Regenerate Key</Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("API key copied")}>Copy Key</Button>
        </div>
        <SaveBar />
      </SettingCard>
    </div>
  )
}

// ── Appearance Settings ──
function AppearanceSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="Theme" desc="Color scheme and dark mode">
        <Field label="Color Theme">
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: "Tomato", color: "oklch(0.55 0.2 28)" },
              { name: "Basil", color: "oklch(0.6 0.15 145)" },
              { name: "Amber", color: "oklch(0.7 0.16 75)" },
              { name: "Grape", color: "oklch(0.55 0.09 300)" },
            ].map((t, i) => (
              <button key={i} className={cn("rounded-lg border-2 p-2 text-center", i === 0 ? "border-primary" : "border-border")}>
                <div className="h-8 w-full rounded mb-1" style={{ background: t.color }} />
                <div className="text-[10px] font-semibold">{t.name}</div>
              </button>
            ))}
          </div>
        </Field>
        <ToggleRow label="Dark mode" desc="Use dark color scheme" />
        <ToggleRow label="Auto dark mode" desc="Follow system preference" defaultOn />
        <ToggleRow label="Compact density" desc="Reduce spacing in tables" />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Layout" desc="Interface layout options">
        <ToggleRow label="Collapsible sidebar" desc="Allow sidebar collapse" defaultOn />
        <ToggleRow label="Sticky topbar" desc="Keep topbar visible on scroll" defaultOn />
        <ToggleRow label="Show breadcrumbs" desc="Display navigation breadcrumbs" />
        <Field label="Default landing module">
          <Select defaultValue="dashboard"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dashboard">Dashboard</SelectItem><SelectItem value="pos">POS</SelectItem><SelectItem value="kds">KDS</SelectItem></SelectContent></Select>
        </Field>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Data Display" desc="How data is presented">
        <Field label="Currency symbol position">
          <Select defaultValue="before"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="before">Before (Rs 1,000)</SelectItem><SelectItem value="after">After (1,000 Rs)</SelectItem></SelectContent></Select>
        </Field>
        <Field label="Number format">
          <Select defaultValue="comma"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="comma">1,000.00</SelectItem><SelectItem value="space">1 000.00</SelectItem><SelectItem value="lakh">1,00,000 (Indian)</SelectItem></SelectContent></Select>
        </Field>
        <ToggleRow label="Show VAT/GST column" desc="Display tax column in tables" defaultOn />
        <ToggleRow label="Animate transitions" desc="Enable Framer Motion animations" defaultOn />
        <SaveBar />
      </SettingCard>

      <SettingCard title="Branding" desc="Custom branding options">
        <Field label="Company Logo">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-12 w-12 rounded-xl text-white font-extrabold text-lg shrink-0" style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 28), oklch(0.58 0.18 45), oklch(0.62 0.15 145))", letterSpacing: "-0.02em" }}>FF</div>
            <Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Logo</Button>
          </div>
        </Field>
        <Field label="Brand Color"><Input defaultValue="#C0392B" className="h-9" /></Field>
        <ToggleRow label="White-label mode" desc="Remove FusionFlow branding" />
        <ToggleRow label="Custom domain" desc="Use your own domain" />
        <SaveBar />
      </SettingCard>
    </div>
  )
}

// ── System Settings ──
function SystemSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SettingCard title="Backup & Recovery" desc="Data backup configuration">
        <ToggleRow label="Automatic daily backup" desc="Backup at 2 AM daily" defaultOn />
        <Field label="Backup destination">
          <Select defaultValue="s3"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="s3">Amazon S3</SelectItem><SelectItem value="local">Local storage</SelectItem><SelectItem value="gdrive">Google Drive</SelectItem></SelectContent></Select>
        </Field>
        <Field label="Retention period (days)"><Input type="number" defaultValue="30" /></Field>
        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => toast.success("Backup started")}><Database className="h-3.5 w-3.5 mr-1.5" /> Backup Now</Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Restore dialog opened")}>Restore</Button>
        </div>
        <SaveBar />
      </SettingCard>

      <SettingCard title="Data Management" desc="Import, export and purge">
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => toast.success("Exporting all data…")}><Download className="h-3.5 w-3.5 mr-1.5" /> Export All Data (JSON)</Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => toast.success("Import dialog opened")}><Upload className="h-3.5 w-3.5 mr-1.5" /> Import Data</Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => toast.success("Products export ready")}><Download className="h-3.5 w-3.5 mr-1.5" /> Export Products (CSV)</Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => toast.success("Customers export ready")}><Download className="h-3.5 w-3.5 mr-1.5" /> Export Customers (CSV)</Button>
        </div>
        <div className="pt-2 border-t">
          <div className="text-xs font-bold uppercase text-destructive mb-2">Danger Zone</div>
          <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => toast.error("Confirm in dialog to purge")}>Purge Old Orders (1+ year)</Button>
        </div>
      </SettingCard>

      <SettingCard title="System Information" desc="ERP version and health">
        <div className="space-y-2 text-xs">
          <InfoRow label="ERP Version" value="FusionFlow ERP v3.1.0" />
          <InfoRow label="Database" value="PostgreSQL 16.2" />
          <InfoRow label="Last backup" value="25 Jul 2025, 02:00 AM" />
          <InfoRow label="Storage used" value="4.2 GB / 50 GB" />
          <InfoRow label="API status" value="● Operational" highlight />
          <InfoRow label="Uptime" value="99.98% (30 days)" />
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={() => toast.success("Checking for updates…")}>Check for Updates</Button>
      </SettingCard>

      <SettingCard title="Performance" desc="Cache and optimization">
        <ToggleRow label="Redis cache" desc="Enable in-memory cache" defaultOn />
        <ToggleRow label="CDN" desc="Serve static assets via CDN" defaultOn />
        <ToggleRow label="Image optimization" desc="Compress uploaded images" defaultOn />
        <ToggleRow label="Query caching" desc="Cache frequent DB queries" defaultOn />
        <Field label="Cache TTL (seconds)"><Input type="number" defaultValue="300" /></Field>
        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => toast.success("Cache cleared")}>Clear Cache</Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Reindexing started")}>Reindex Database</Button>
        </div>
        <SaveBar />
      </SettingCard>
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", highlight && "text-chart-3")}>{value}</span>
    </div>
  )
}
