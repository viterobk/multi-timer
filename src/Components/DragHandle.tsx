import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import './DragHandle.css';

type Props = {
  label: string;
  attributes?: any;
  listeners?: any;
};

const DragHandle = ({ label, attributes, listeners }: Props) => (
  <button
    type="button"
    className="DragHandle"
    aria-label={label}
    {...attributes}
    {...listeners}
  >
    <DragIndicatorIcon />
  </button>
);

export default DragHandle;
