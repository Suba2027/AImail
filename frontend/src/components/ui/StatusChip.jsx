import { STATUS_STYLES } from '../../theme/categories';

const StatusChip = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

export default StatusChip;
