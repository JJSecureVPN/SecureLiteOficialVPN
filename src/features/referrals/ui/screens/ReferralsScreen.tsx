import { useEffect, useState } from 'react';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import './ReferralsScreen.css';

interface UserData {
  id: string;
  email: string;
  nombre?: string;
  total_earned?: number;
}

const url = 'https://shop.jhservices.com.ar/api/referidos/admin/usuarios-saldo?limit=20';

const RANKS = [
  'LEYENDA DE LA RED',
  'MASTER CONECTOR',
  'NINJA EXPANDOR',
  'INFLUENCER ÉLITE',
  'EMBAJADOR PREMIUM',
];
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#7B68EE', '#7B68EE'];
const RANK_ICONS = ['fa-crown', 'fa-medal', 'fa-medal', 'fa-star', 'fa-star'];

export function ReferralsScreen() {
  const sectionStyle = useSectionStyle(24, 24);
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unmounted = false;
    const fetchTop = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener datos');
        const json = await response.json();
        if (!unmounted) {
          const list = Array.isArray(json) ? json : json.data || json;
          if (Array.isArray(list)) {
            const sorted = list
              .filter(
                (u) => typeof u.total_earned === 'number' || typeof u.total_earned === 'string',
              )
              .map((u) => ({ ...u, total_earned: Number(u.total_earned) || 0 }))
              .sort((a, b) => b.total_earned - a.total_earned)
              .slice(0, 5);
            setData(sorted);
          } else {
            setData([]);
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (!unmounted) {
          setError(err.message || 'Error de red');
          setLoading(false);
        }
      }
    };
    fetchTop();
    return () => {
      unmounted = true;
    };
  }, []);

  const maxEarned = data.length > 0 ? data[0].total_earned! : 1;

  if (loading) {
    return (
      <section className="screen referrals-screen" style={sectionStyle}>
        <div className="referrals-empty-state">
          <div className="referrals-loader" />
          <p>Cargando Top Globales...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="screen referrals-screen" style={sectionStyle}>
        <div className="referrals-empty-state">
          <i
            className="fa fa-exclamation-triangle"
            style={{ fontSize: '2.5rem', color: '#ff4444' }}
          />
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="screen referrals-screen" style={sectionStyle}>
      <div className="referrals-content">
        <div className="referrals-inner">
          {/* Header */}
          <div className="referrals-header">
            <span className="eyebrow">SALÓN DE LA FAMA</span>
            <h1 className="title">TOP Globales</h1>
            <p className="subtitle">Los usuarios más influyentes y comprometidos de nuestra red.</p>
          </div>

          {/* Lista */}
          <div className="referrals-list">
            {data.map((user, index) => {
              const nombre =
                user.nombre ||
                (user.email ? user.email.split('@')[0].toUpperCase() : 'DESCONOCIDO');
              const percent = user.total_earned! > 0 ? (user.total_earned! / maxEarned) * 100 : 0;
              const rankLabel = RANKS[index] || 'PROMOTOR ACTIVO';
              const color = RANK_COLORS[index] || '#ffffff';
              const icon = RANK_ICONS[index] || 'fa-user';
              const filledBars = Math.max(1, Math.ceil((percent / 100) * 5));

              return (
                <div
                  key={user.id || index}
                  className="referral-card"
                  style={
                    {
                      '--card-color': color,
                      borderColor: `${color}28`,
                      animationDelay: `${index * 0.09}s`,
                    } as React.CSSProperties
                  }
                >
                  {/* Fila superior */}
                  <div className="card-top-row">
                    <div className="card-badge" style={{ borderColor: `${color}35` }}>
                      <i className={`fa ${icon}`} style={{ color }} />
                      <span className="badge-text" style={{ color }}>
                        TOP {index + 1}
                      </span>
                    </div>

                    <div className="card-user-info">
                      <div className="user-name">
                        <span className="user-rank-num" style={{ color: `${color}80` }}>
                          #{index + 1}
                        </span>
                        {nombre}
                      </div>
                      <div className="user-title-chip" style={{ color, borderColor: `${color}25` }}>
                        {rankLabel}
                      </div>
                    </div>
                  </div>

                  {/* Fila inferior */}
                  <div className="card-bottom-row">
                    <div className="card-inf-meter">
                      <span className="meter-label">INFLUENCIA</span>
                      <div className="meter-bars">
                        {[0, 1, 2, 3, 4].map((b) => (
                          <div
                            key={b}
                            className="meter-bar"
                            style={{
                              backgroundColor: b < filledBars ? color : 'rgba(255,255,255,0.08)',
                              boxShadow: b < filledBars ? `0 0 6px ${color}55` : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
