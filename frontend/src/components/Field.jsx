<<<<<<< HEAD
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
=======
export default function Field({ label, type = 'text', placeholder, icon, trailing, wide, hideLabel = false }) {
>>>>>>> 48dd08f68605d92a39284804b25ee5f88a71cc20
  return (
    <label className={`field ${wide ? 'field--wide' : ''}`}>
      {hideLabel ? null : <span className="field__label">{label}</span>}
      <span className="field__control">
        {icon ? <span className="field__icon">{icon}</span> : null}
<<<<<<< HEAD
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
=======
        <input type={type} placeholder={placeholder} />
>>>>>>> 48dd08f68605d92a39284804b25ee5f88a71cc20
        {trailing ? <span className="field__trailing">{trailing}</span> : null}
      </span>
    </label>
  );
}
