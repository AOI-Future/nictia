"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Release {
  title: string;
  type: "Album" | "Single" | "EP";
  releaseDate: string;
  trackCount: number;
  coverArt: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  youtubeMusicUrl: string;
}

const RELEASES: Release[] = [
  {
    title: "無彩色ポップ",
    type: "Single",
    releaseDate: "2026-02-27",
    trackCount: 1,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/9d/d1/55/9dd155e7-cdf4-dea9-1e73-f150c556b17f/artwork.jpg/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/%E7%84%A1%E5%BD%A9%E8%89%B2%E3%83%9D%E3%83%83%E3%83%97-single/1871808690",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
  {
    title: "Metasonica",
    type: "Album",
    releaseDate: "2026-02-07",
    trackCount: 7,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/49/a8/c9/49a8c93f-b0d8-abb1-b760-e069194caf90/artwork.jpg/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/metas%C3%B3nica/1871826724",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
  {
    title: "PRLN ver 1.2 + ver 2.0 = ?",
    type: "Single",
    releaseDate: "2026-02-11",
    trackCount: 3,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/33/90/19/33901914-09dc-94f1-4131-06d31c46dd04/artwork.jpg/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/prln-ver-1-2-ver-2-0-single/1872316882",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
  {
    title: "Walking into the Summer Forest",
    type: "Single",
    releaseDate: "2025-07-17",
    trackCount: 1,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/96/70/65/967065cc-1529-92d4-7bc1-c757e69a44d5/682106185678.png/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/walking-into-the-summer-forest-single/1823339680",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
  {
    title: "Yaruki Switch",
    type: "Single",
    releaseDate: "2025-03-07",
    trackCount: 1,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/fd/3a/1a/fd3a1afe-a0d8-346a-e066-890220df55ac/020357363184.png/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/%E3%82%84%E3%82%8B%E6%B0%97%E3%82%B9%E3%82%A4%E3%83%83%E3%83%81-single/1799215658",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
  {
    title: "Milk & Dark",
    type: "Single",
    releaseDate: "2025-02-27",
    trackCount: 1,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/71/e1/8a/71e18aad-9b30-5977-71ba-29105f88e287/021865957322.png/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/milk-dark-single/1796177567",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
  {
    title: "Sauce Encyclopedia",
    type: "Album",
    releaseDate: "2025-02-07",
    trackCount: 8,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/5f/7c/3e/5f7c3ee8-ae74-021e-4f21-5b4bd633bc0c/021865557720.png/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/sauce-encyclopedia/1794947274",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
  {
    title: "Tokyo Synesthesia",
    type: "Single",
    releaseDate: "2025-02-06",
    trackCount: 1,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f0/a5/e0/f0a5e038-c8b4-795d-1ed9-4df399d1ce37/021865405250.png/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/tokyo-synesthesia-single/1792884282",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
  {
    title: "Cuando el Sol y la Luna Cuentan Sus Secretos",
    type: "Album",
    releaseDate: "2025-02-04",
    trackCount: 15,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/12/3f/3f/123f3ff3-0f6e-f903-c866-6cb778a7c575/021865405205.png/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/cuando-el-sol-y-la-luna-cuentan-sus-secretos/1792884201",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
  {
    title: "Yuki ni Kakushita Egao",
    type: "Single",
    releaseDate: "2025-01-23",
    trackCount: 1,
    coverArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/0f/c5/b2/0fc5b2d5-9b90-c817-24e9-7088616baefc/021865001070.png/600x600bb.jpg",
    spotifyUrl: "https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6",
    appleMusicUrl:
      "https://music.apple.com/jp/album/%E9%9B%AA%E3%81%AB%E9%9A%A0%E3%81%97%E3%81%9F%E7%AC%91%E9%A1%94-single/1790248506",
    youtubeMusicUrl:
      "https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A",
  },
];

function ReleaseCard({ release, index }: { release: Release; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card */}
      <div className="relative overflow-hidden border border-white/5 bg-black/40 backdrop-blur-sm transition-all duration-300 group-hover:border-cyan-400/30 group-hover:bg-black/60">
        {/* Cover Art */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={release.coverArt}
            alt={release.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-4"
              >
                <a
                  href={release.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[#1DB954]/60 text-[#1DB954] text-[10px] tracking-wider hover:bg-[#1DB954]/20 transition-colors w-full text-center"
                >
                  SPOTIFY
                </a>
                <a
                  href={release.appleMusicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[#fc3c44]/60 text-[#fc3c44] text-[10px] tracking-wider hover:bg-[#fc3c44]/20 transition-colors w-full text-center"
                >
                  APPLE MUSIC
                </a>
                <a
                  href={release.youtubeMusicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-red-500/60 text-red-400 text-[10px] tracking-wider hover:bg-red-500/20 transition-colors w-full text-center"
                >
                  YOUTUBE MUSIC
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Type badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 border border-cyan-400/20 text-[8px] text-cyan-400/70 tracking-wider">
            {release.type.toUpperCase()}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-white/80 text-xs font-medium truncate leading-tight">
            {release.title}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-white/30 text-[9px]">
              {release.releaseDate.slice(0, 7)}
            </span>
            <span className="text-cyan-400/30 text-[9px]">
              {release.trackCount} {release.trackCount === 1 ? "track" : "tracks"}
            </span>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/0 group-hover:border-cyan-400/40 transition-colors" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/0 group-hover:border-cyan-400/40 transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/0 group-hover:border-cyan-400/40 transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/0 group-hover:border-cyan-400/40 transition-colors" />
      </div>
    </motion.div>
  );
}

export default function Discography() {
  return (
    <section className="relative z-10 px-4 md:px-8 py-20">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-px bg-cyan-400/40" />
          <span className="text-cyan-400/50 text-[10px] tracking-[0.4em]">
            DISCOGRAPHY
          </span>
        </div>
        <h2 className="text-white/80 text-lg md:text-xl tracking-wider pl-11">
          RELEASES
        </h2>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {RELEASES.map((release, i) => (
          <ReleaseCard key={release.title} release={release} index={i} />
        ))}
      </div>
    </section>
  );
}
