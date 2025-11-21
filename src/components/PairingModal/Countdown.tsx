import { useEffect, useMemo, useState } from "react";
import { Text } from "tamagui";

export default function Countdown({
  expiresAt,
}: {
  expiresAt?: number | null;
}) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { label, expired } = useMemo(() => {
    if (!expiresAt) return { label: "--:--", expired: false };
    const delta = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const m = Math.floor(delta / 60)
      .toString()
      .padStart(2, "0");
    const s = (delta % 60).toString().padStart(2, "0");
    return { label: `${m}:${s}`, expired: delta === 0 };
  }, [expiresAt, now]);

  return (
    <Text
      fontFamily="$body"
      color={expired ? "$warning" : "$color"}
      fontWeight="600"
      fontSize={14}
    >
      Code expires in{" "}
      <Text
        fontFamily="$body"
        color={expired ? "$warning" : "$primary"}
        fontWeight="700"
      >
        {label}
      </Text>
    </Text>
  );
}
