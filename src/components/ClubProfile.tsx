import { useState, useEffect } from 'react';
import { Lock, Play, Camera, Film } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PaymentModal from './PaymentModal';

interface ClubProfileData {
  id: string;
  name: string;
  bio: string;
  banner_url: string | null;
  avatar_url: string | null;
  price: number;
  button_text: string;
  button_color: string;
  button_icon: string;
  deliverable_link: string | null;
  photos_count: number;
  videos_count: number;
}

interface GalleryItem {
  id: string;
  type: string;
  url: string;
  is_preview: boolean;
}

const ClubProfile = () => {
  const [profile, setProfile] = useState<ClubProfileData | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [profileRes, galleryRes] = await Promise.all([
        supabase.from('club_profile').select('*').limit(1).maybeSingle(),
        supabase.from('gallery_items').select('*').eq('is_preview', true).order('display_order').limit(6)
      ]);

      if (profileRes.data) {
        setProfile({
          ...profileRes.data,
          button_color: profileRes.data.button_color || '#f97316',
          button_icon: profileRes.data.button_icon || '🔥',
          deliverable_link: profileRes.data.deliverable_link || null
        });
      }
      if (galleryRes.data) setGalleryItems(galleryRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const buttonColor = profile?.button_color || '#f97316';

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-56 md:h-72">
        {profile?.banner_url ? (
          <img 
            src={profile.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-primary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Profile Section */}
      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-8">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div 
            className="w-28 h-28 rounded-full border-4 overflow-hidden shadow-2xl ring-4"
            style={{ 
              borderColor: buttonColor,
              boxShadow: `0 0 20px ${buttonColor}30`
            }}
          >
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-card flex items-center justify-center text-muted-foreground">
                ?
              </div>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-foreground">
            {profile?.name || 'Nome do Modelo'}
          </h1>
          
          {/* Verified Badge */}
          <div className="flex items-center gap-1.5 mt-1">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: buttonColor }}
            >
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color: buttonColor }}>Perfil Verificado</span>
          </div>
        </div>

        {/* Description Card */}
        <div className="mt-6 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
          <p className="text-muted-foreground text-sm text-center leading-relaxed">
            {profile?.bio || 'Conteúdo exclusivo'}
          </p>
        </div>

        {/* Stats - New Layout */}
        <div className="mt-4 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${buttonColor}20` }}
            >
              <Camera className="w-5 h-5" style={{ color: buttonColor }} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{profile?.photos_count || 0}</p>
              <p className="text-xs text-muted-foreground">Fotos</p>
            </div>
          </div>
          
          <div className="w-px h-10 bg-border" />
          
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${buttonColor}20` }}
            >
              <Film className="w-5 h-5" style={{ color: buttonColor }} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{profile?.videos_count || 0}</p>
              <p className="text-xs text-muted-foreground">Vídeos</p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Pagamento Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Acesso Privado</span>
          </div>
        </div>

        {/* Purchase Button - Dynamic Color */}
        <div className="mt-6">
          <button 
            onClick={() => setShowPayment(true)}
            className="w-full relative group overflow-hidden rounded-2xl p-[2px] transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              background: `linear-gradient(135deg, ${buttonColor}, ${buttonColor}cc)` 
            }}
          >
            <div className="relative flex items-center justify-center gap-2 rounded-2xl bg-background px-6 py-4 transition-all group-hover:bg-background/80">
              <span className="text-xl">{profile?.button_icon || '🔥'}</span>
              <span className="font-bold text-foreground">{profile?.button_text || 'Desbloquear'}</span>
              <span className="font-bold" style={{ color: buttonColor }}>
                R$ {profile?.price?.toFixed(2).replace('.', ',') || '29,90'}
              </span>
            </div>
          </button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Acesso imediato após o pagamento
          </p>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          price={profile?.price || 29.90}
          productName={`Acesso VIP - ${profile?.name || 'Conteúdo Exclusivo'}`}
          deliverableLink={profile?.deliverable_link}
        />

        {/* What's Included */}
        <div className="mt-6 bg-card/30 rounded-2xl p-4 border border-border/30">
          <p className="text-sm font-medium text-foreground mb-3 text-center">O que você vai receber:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: buttonColor }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Acesso a todas as fotos e vídeos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: buttonColor }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Conteúdo exclusivo e privado</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: buttonColor }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Atualizações frequentes</span>
            </div>
          </div>
        </div>

        {/* Preview Gallery */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-foreground">Prévia do conteúdo</p>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-card rounded-full">
              🔒 Bloqueado
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {galleryItems.length > 0 ? (
              galleryItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {item.type === 'photo' ? (
                    <img 
                      src={item.url}
                      alt="Preview"
                      className="w-full h-full object-cover blur-lg scale-110"
                    />
                  ) : (
                    <video 
                      src={item.url}
                      className="w-full h-full object-cover blur-lg scale-110"
                    />
                  )}
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                    style={{ 
                      background: `linear-gradient(180deg, ${buttonColor}20 0%, ${buttonColor}40 100%)` 
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm"
                      style={{ backgroundColor: `${buttonColor}30` }}
                    >
                      {item.type === 'video' ? (
                        <Play className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" />
                      ) : (
                        <Lock className="w-5 h-5 text-white drop-shadow-lg" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              [...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="aspect-[3/4] rounded-xl overflow-hidden relative shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${buttonColor}10 0%, ${buttonColor}20 100%)`
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${buttonColor}20` }}
                    >
                      <Lock className="w-4 h-4" style={{ color: buttonColor }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;
