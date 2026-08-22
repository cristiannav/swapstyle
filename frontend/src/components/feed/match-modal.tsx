import { Link } from "react-router";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { Modal, Button, Image } from "@/components/ui";
import type { Match } from "@/types/api";

interface MatchModalProps {
  match: Match;
  open: boolean;
  onClose: () => void;
}

export function MatchModal({ match, open, onClose }: MatchModalProps) {
  const left = match.garmentA?.images?.[0]?.url;
  const right = match.garmentB?.images?.[0]?.url;

  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <div className="text-center space-y-6 -m-5 p-7 bg-[radial-gradient(ellipse_at_top,_var(--color-brand-50),_var(--color-surface)_70%)] rounded-2xl">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-gold-500 shadow-card-hover"
        >
          <Heart className="h-8 w-8 text-white fill-current" />
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-gold-300" />
        </motion.div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-600 font-semibold">
            ¡Es un match!
          </p>
          <motion.h2
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-display text-4xl gradient-brand-text leading-tight"
          >
            <span className="text-display-italic">A los dos</span> les gustó
          </motion.h2>
          <p className="text-sm text-text-secondary max-w-xs mx-auto">
            Empezá la conversación y coordinen el intercambio.
          </p>
        </div>

        <div className="flex justify-center gap-4 py-2">
          {[
            { src: left, rotate: -8, delay: 0.2 },
            { src: right, rotate: 8, delay: 0.3 },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0, rotate: card.rotate * 1.4 }}
              animate={{ y: 0, opacity: 1, rotate: card.rotate }}
              transition={{ delay: card.delay, type: "spring", stiffness: 180 }}
              className="relative h-36 w-28 rounded-2xl overflow-hidden bg-surface-muted shadow-card-hover ring-4 ring-white"
            >
              {card.src && (
                <Image
                  src={card.src}
                  alt="Prenda"
                  fill
                  className="object-cover"
                />
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link to={`/matches/${match.id}/chat`} className="w-full">
            <Button variant="primary" fullWidth size="lg">
              Enviar mensaje
            </Button>
          </Link>
          <Button variant="ghost" onClick={onClose} fullWidth>
            Seguir explorando
          </Button>
        </div>
      </div>
    </Modal>
  );
}
