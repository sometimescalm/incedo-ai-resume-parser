import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const SemiCircularScore = ({ score }) => {
  return (
    <div style={{ width: 200, height: 100 }}>
      <CircularProgressbar
        value={score}
        maxValue={100}
        text={`${score}%`}
        circleRatio={0.5}
        styles={buildStyles({
          rotation: 0.75,
          strokeLinecap: 'round',
          trailColor: '#eee',
          pathColor:
            score < 50 ? '#f5222d' : score < 70 ? '#fa8c16' : score < 85 ? '#52c41a' : '#237804',
          textColor: '#000',
        })}
      />
    </div>
  );
};

export default SemiCircularScore;
