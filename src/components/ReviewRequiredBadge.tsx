export function ReviewRequiredBadge({ required }: { required: boolean }) {
  if (!required) return <span className="badge quiet">자동 승인</span>
  return <span className="badge danger">검수 필요</span>
}
