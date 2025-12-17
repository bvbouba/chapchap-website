import dayjs from "dayjs";

// Helper: get attribute value (name or value)


interface attributeType {
    __typename?: "SelectedAttribute";
    attribute: { 
        __typename?: 'Attribute', 
        name?: string | null, 
        slug?: string | null, 
    },
    values: Array<{
        __typename?: "AttributeValue";
        name?: string | null;
        dateTime?: string | null;
        boolean?: boolean | null;
        value?: string | null;
        translation?: { __typename?: "AttributeValueTranslation"; name: string } | null;
    }>;
 }


export const getAttrValue = (
    attrs: attributeType[],
    slug: string
): string | undefined => {
    const found = attrs.find((attr) => attr.attribute?.slug === slug);
    return found?.values?.[0]?.name ?? found?.values?.[0]?.value ?? undefined;
};

// Parse duration string into total minutes
export const parseDurationToMinutes = (raw?: string): number => {
    if (!raw) return 0;
    const s = raw.trim().toLowerCase();
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    const minMatch = s.match(/^(\d+)\s*min(?:ute)?s?$/);
    if (minMatch) return parseInt(minMatch[1], 10);
    const hmMatch = s.match(/(\d+)\s*h(?:ours?)?\s*(\d+)?/);
    if (hmMatch) {
        const h = parseInt(hmMatch[1], 10);
        const m = hmMatch[2] ? parseInt(hmMatch[2], 10) : 0;
        return h * 60 + m;
    }
    const colonMatch = s.match(/^(\d{1,2}):(\d{2})$/);
    if (colonMatch) {
        const h = parseInt(colonMatch[1], 10);
        const m = parseInt(colonMatch[2], 10);
        return h * 60 + m;
    }
    const numMatch = s.match(/(\d+)/);
    if (numMatch) return parseInt(numMatch[1], 10);
    return 0;
};

export const formatMinutes = (mins: number): string | null => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}min`;
    return `${h}h${m.toString().padStart(2, "0")}`;
};

export const formatTimeUTC = (d: Date) =>
    d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

export const getTripInformation=({attributes}:{attributes:attributeType[]}) => {

  console.log(attributes)
  const durationRaw = getAttrValue(attributes, "estimated-duration");
  const company = getAttrValue(attributes, "bus-operator");
  const departureCity = getAttrValue(attributes, "departure-city");
  const arrivalCity = getAttrValue(attributes, "arrival-city");
  const departureStation = getAttrValue(attributes, "departure-station");
  const arrivalStation = getAttrValue(attributes, "arrival-station");
  const dateTime = getAttrValue(attributes, "departure-time");

  const departureDate = dateTime ? new Date(dateTime) : null;
  const durationMinutes = parseDurationToMinutes(durationRaw);
  const readableDuration = formatMinutes(durationMinutes);

  let arrivalTimeStr: string | null = null;
  if (departureDate && durationMinutes > 0) {
    const arrivalMs = departureDate.getTime() + durationMinutes * 60_000;
    const arrivalDate = new Date(arrivalMs);
    arrivalTimeStr = formatTimeUTC(arrivalDate);
  }

  const departureTimeStr = departureDate ? formatTimeUTC(departureDate) : "— —";
  const formattedDate = departureDate
    ? dayjs(departureDate).locale("fr").format("ddd D MMM")
    : "";

return{
    company,
    departureCity,
    arrivalCity,
    departureStation,
    arrivalStation,
    readableDuration,
    departureTimeStr,
    formattedDate,
    arrivalTimeStr
}
}

