// Notice we pass { onSelect } into the function arguments
export default function AnimalSelector({ onSelect }) {
    const animals = ['Cat', 'Dog', 'Bird', "Cow"];

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '350px' }}>
            <h2>Select Your Animal</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {animals.map(animal => (
                    <button
                        key={animal}
                        onClick={() => onSelect(animal)} // <-- This triggers the state change in App.jsx
                        style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        {animal}
                    </button>
                ))}
            </div>
        </div>
    );
}