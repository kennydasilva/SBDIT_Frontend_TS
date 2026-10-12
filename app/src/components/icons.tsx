import type { ComponentType, CSSProperties } from "react";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import * as fa from "@fortawesome/free-solid-svg-icons";

// Ícones de toda a aplicação: Font Awesome (sólidos). Este ficheiro é o
// único sítio que conhece a biblioteca - as páginas importam daqui, pelos
// nomes já usados no código, para o conjunto poder ser trocado num só lugar.

export interface IconProps {
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  /** Aceite por compatibilidade; os ícones sólidos não têm traço. */
  strokeWidth?: number;
}

export type LucideIcon = ComponentType<IconProps>;

const criar = (def: IconDefinition): LucideIcon =>
  function Icone({ size = 24, className, style, title }: IconProps) {
    const [largura, altura, , , caminho] = def.icon;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${largura} ${altura}`}
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        style={style}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
      >
        {title && <title>{title}</title>}
        {(Array.isArray(caminho) ? caminho : [caminho]).map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  };

// Navegação e acções
export const Menu = criar(fa.faBars);
export const X = criar(fa.faXmark);
export const ArrowLeft = criar(fa.faArrowLeft);
export const ArrowRight = criar(fa.faArrowRight);
export const ChevronLeft = criar(fa.faChevronLeft);
export const ChevronRight = criar(fa.faChevronRight);
export const Search = criar(fa.faMagnifyingGlass);
export const Plus = criar(fa.faPlus);
export const PlusCircle = criar(fa.faCirclePlus);
export const Pencil = criar(fa.faPen);
export const PenLine = criar(fa.faPenToSquare);
export const Trash2 = criar(fa.faTrashCan);
export const Save = criar(fa.faFloppyDisk);
export const Send = criar(fa.faPaperPlane);
export const Upload = criar(fa.faArrowUpFromBracket);
export const Undo2 = criar(fa.faRotateLeft);
export const RefreshCw = criar(fa.faRotate);
export const Eye = criar(fa.faEye);
export const LogOut = criar(fa.faRightFromBracket);
export const LogIn = criar(fa.faRightToBracket);
export const Paperclip = criar(fa.faPaperclip);
export const Link2 = criar(fa.faLink);
export const Download = criar(fa.faDownload);
export const Filter = criar(fa.faFilter);
export const Loader2 = criar(fa.faCircleNotch);

// Estado e avisos
export const AlertTriangle = criar(fa.faTriangleExclamation);
export const CheckCircle = criar(fa.faCircleCheck);
export const CheckCircle2 = criar(fa.faCircleCheck);
export const CheckCheck = criar(fa.faCheckDouble);
export const CheckSquare = criar(fa.faSquareCheck);
export const XCircle = criar(fa.faCircleXmark);
export const Ban = criar(fa.faBan);
export const Clock = criar(fa.faClock);
export const Archive = criar(fa.faBoxArchive);
export const Bell = criar(fa.faBell);
export const BellRing = criar(fa.faBell);
export const BellOff = criar(fa.faBellSlash);

// Pessoas e contas
export const User = criar(fa.faUser);
export const Users = criar(fa.faUsers);
export const UserCircle = criar(fa.faCircleUser);
export const UserPlus = criar(fa.faUserPlus);
export const UserCheck = criar(fa.faUserCheck);
export const Shield = criar(fa.faUserShield);
export const ShieldCheck = criar(fa.faUserShield);
export const KeyRound = criar(fa.faKey);
export const Mail = criar(fa.faEnvelope);
export const MailCheck = criar(fa.faEnvelopeCircleCheck);
export const Phone = criar(fa.faPhone);
export const Trophy = criar(fa.faTrophy);

// Denúncias, trânsito e mapa
export const LayoutDashboard = criar(fa.faChartLine);
export const FileText = criar(fa.faFileLines);
export const ClipboardList = criar(fa.faClipboardList);
export const Calendar = criar(fa.faCalendarDays);
export const Video = criar(fa.faVideo);
export const Siren = criar(fa.faCarBurst);
export const Gauge = criar(fa.faGaugeHigh);
export const ArrowLeftRight = criar(fa.faRightLeft);
export const Gavel = criar(fa.faGavel);
export const ScanSearch = criar(fa.faFilm);
export const MapPin = criar(fa.faLocationDot);
export const MapPinned = criar(fa.faMapLocationDot);
export const MapPinOff = criar(fa.faLocationCrosshairs);
export const Route = criar(fa.faRoute);
export const LandPlot = criar(fa.faDrawPolygon);
export const Building2 = criar(fa.faBuildingShield);
export const Settings = criar(fa.faGear);
export const BarChart3 = criar(fa.faChartColumn);

// Relatórios
export const FileDown = criar(fa.faFilePdf);
export const FileSpreadsheet = criar(fa.faFileExcel);
export const PieChart = criar(fa.faChartPie);
export const RotateCcw = criar(fa.faRotateLeft);
