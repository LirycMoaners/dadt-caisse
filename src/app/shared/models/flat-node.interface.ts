export interface FlatNode<T> {
  level: number;
  isExpandable: boolean;
  label: string;
  value: T;
  isExpanded?: boolean;
  isSelected?: boolean;
}
