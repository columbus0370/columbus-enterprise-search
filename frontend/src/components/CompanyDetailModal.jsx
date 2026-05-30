import { FiX, FiMail, FiPhone, FiGlobe, FiMapPin, FiCalendar, FiDollarSign, FiUsers } from 'react-icons/fi';
import { formatSales, formatEmployees, formatDate } from '../utils/formatters';

export const CompanyDetailModal = ({ company, onClose, onGenerateProposal }) => {
  if (!company) return null;

  const fields = [
    { icon: FiMapPin, label: '住所', value: company.address },
    { icon: FiPhone, label: '電話', value: company.phone },
    { icon: FiGlobe, label: 'Web', value: company.url, link: true },
    { icon: FiCalendar, label: '設立', value: formatDate(company.established) },
    { icon: FiDollarSign, label: '資本金', value: formatSales(company.capital) },
    { icon: FiUsers, label: '従業員', value: formatEmployees(company.employees) },
    { icon: FiDollarSign, label: '売上', value: formatSales(company.sales) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{company.name}</h2>
            <p className="text-sm text-gray-400">{company.industry} · {company.prefecture}</p>
          </div>
          <button
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-2">
          {fields.map(({ icon: Icon, label, value, link }) => (
            value ? (
              <div key={label} className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0 text-gray-500" size={14} />
                <div className="flex gap-2 text-sm min-w-0">
                  <span className="text-gray-500 shrink-0 w-14">{label}</span>
                  {link ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:underline truncate">
                      {value}
                    </a>
                  ) : (
                    <span className="text-gray-200">{value}</span>
                  )}
                </div>
              </div>
            ) : null
          ))}
        </div>

        <div className="pt-2">
          <button
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={() => { onGenerateProposal(company); onClose(); }}
          >
            <FiMail size={15} />
            この企業の営業メールを生成
          </button>
        </div>
      </div>
    </div>
  );
};
