import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

export default function Typewriter({ text, speed = 50, className = '', style }) {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
        let i = 0;
        setDisplayed('');
        const interval = setInterval(() => {
            setDisplayed((prev) => prev + (text?.[i] || ''));
            i++;
            if (!text || i >= text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span className={className} style={style}>{displayed}</span>
    );
}

Typewriter.propTypes = {
    text: PropTypes.string.isRequired,
    speed: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
};
