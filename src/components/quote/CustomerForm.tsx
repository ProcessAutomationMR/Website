import { CustomerInfo } from '../../types/quote.types';

interface CustomerFormProps {
  customerInfo: CustomerInfo;
  onChange: (info: CustomerInfo) => void;
  honeypot: string;
  onHoneypotChange: (value: string) => void;
}

export function CustomerForm({ customerInfo, onChange, honeypot, onHoneypotChange }: CustomerFormProps) {
  return (
    <div className="bg-white shadow-lg p-8">
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => onHoneypotChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
      />
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerInfo.lastName}
            onChange={(e) => onChange({ ...customerInfo, lastName: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 focus:border-brown-950 focus:ring-1 focus:ring-brown-950 outline-none transition-colors"
            placeholder="Dupont"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerInfo.firstName}
            onChange={(e) => onChange({ ...customerInfo, firstName: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 focus:border-brown-950 focus:ring-1 focus:ring-brown-950 outline-none transition-colors"
            placeholder="Jean"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => onChange({ ...customerInfo, email: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 focus:border-brown-950 focus:ring-1 focus:ring-brown-950 outline-none transition-colors"
            placeholder="jean.dupont@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => onChange({ ...customerInfo, phone: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 focus:border-brown-950 focus:ring-1 focus:ring-brown-950 outline-none transition-colors"
            placeholder="+33 6 12 34 56 78"
          />
        </div>
      </div>
    </div>
  );
}
