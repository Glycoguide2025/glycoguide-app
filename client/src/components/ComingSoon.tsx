import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Music, BookOpen, Layers, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotifyModal from "@/components/NotifyModal";

interface ComingSoonProps {
  type: string;
}

export default function ComingSoon({ type }: ComingSoonProps) {
  const [openModal, setOpenModal] = useState(false);

  let Icon;
  switch (type) {
    case "Video":
      Icon = Video;
      break;
    case "Audio":
      Icon = Music;
      break;
    case "Courses":
      Icon = Layers;
      break;
    default:
      Icon = BookOpen;
      break;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-20 text-center"
        data-testid={`coming-soon-${type.toLowerCase()}`}
      >
        <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-full mb-4 shadow-sm">
          <Icon className="w-10 h-10 text-blue-500" />
        </div>
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          {type} Content Coming Soon
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          We're curating new {type.toLowerCase()} resources to enhance your GlycoGuide experience.
          Check back soon for mindful, science-backed updates!
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-6"
        >
          <Button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-sm"
            data-testid="button-notify-me"
          >
            <Bell className="w-4 h-4" />
            Notify Me
          </Button>
        </motion.div>
      </motion.div>

      <NotifyModal open={openModal} onClose={() => setOpenModal(false)} type={type} />
    </>
  );
}
