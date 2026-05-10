export default function Field({
  label,
  type = 'text',
  placeholder,
  icon,
  trailing,
  wide,
  hideLabel = false,
  value,
  onChange,
  name,
  autoComplete,
}) {
  return (
    <label className={`field ${wide ? 'field--wide' : ''}`}>
      {hideLabel ? null : <span className="field__label">{label}</span>}
      <span className="field__control">
        {icon ? <span className="field__icon">{icon}</span> : null}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        {trailing ? <span className="field__trailing">{trailing}</span> : null}
      </span>
    </label>
  );
}
