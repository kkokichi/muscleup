"use client";

import { useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import type { Checkin } from "@/types";
import { DEFAULT_MAP_CENTER, getMapsApiKey } from "@/lib/maps";
import { formatDateShort } from "@/utils/date";

interface LatLng {
  lat: number;
  lng: number;
}

interface CheckinMapCanvasProps {
  checkins: Checkin[];
  center: LatLng;
  /** 作成中の仮ピン（チェックイン投稿時） */
  draftPin?: LatLng | null;
  /** 地図タップで位置を選ぶ（投稿モードのみ有効） */
  onPickLocation?: (pos: LatLng) => void;
  height?: number;
}

/**
 * Google Maps 本体。APIキーが無い場合はこのコンポーネントを描画しない
 * （呼び出し側の GymMapView がフォールバックUIを出す）。
 */
export function CheckinMapCanvas({
  checkins,
  center,
  draftPin,
  onPickLocation,
  height = 320,
}: CheckinMapCanvasProps) {
  const apiKey = getMapsApiKey();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!apiKey) return null;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border"
      style={{ height }}
    >
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center ?? DEFAULT_MAP_CENTER}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI
          clickableIcons={false}
          onClick={(e) => {
            const pos = e.detail.latLng;
            if (pos && onPickLocation) onPickLocation(pos);
          }}
          style={{ width: "100%", height: "100%" }}
        >
          {checkins.map((c) => (
            <Marker
              key={c.id}
              position={{ lat: c.lat, lng: c.lng }}
              onClick={() => setOpenId(c.id)}
            />
          ))}

          {draftPin && <Marker position={draftPin} />}

          {openId &&
            (() => {
              const c = checkins.find((x) => x.id === openId);
              if (!c) return null;
              return (
                <InfoWindow
                  position={{ lat: c.lat, lng: c.lng }}
                  onCloseClick={() => setOpenId(null)}
                >
                  <div style={{ maxWidth: 200, color: "#111" }}>
                    <strong style={{ fontSize: 13 }}>{c.gymName}</strong>
                    <p style={{ fontSize: 12, margin: "4px 0" }}>{c.comment}</p>
                    <span style={{ fontSize: 11, color: "#666" }}>
                      {c.authorName}・{formatDateShort(c.createdAt.slice(0, 10))}
                    </span>
                  </div>
                </InfoWindow>
              );
            })()}
        </Map>
      </APIProvider>
    </div>
  );
}
