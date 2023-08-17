import { Grid, Select } from '@awsui/components-react';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

interface ISceneRuleTargetAnimationEditorProps {
  targetValue: string;
  onChange: (target: string) => void;
}

export const SceneRuleTargetAnimationEditor: React.FC<ISceneRuleTargetAnimationEditorProps> = ({
  onChange,
}: ISceneRuleTargetAnimationEditorProps) => {
  const [selectedAnimation, setSelectedAnimation] = useState('Start');
  const intl = useIntl();

  const options = [
    { label: 'Start', value: 'Start' },
    { label: 'Stop', value: 'Stop' },
  ];

  return (
    <Grid gridDefinition={[{ colspan: 9 }, { colspan: 2 }]}>
      <Select
        selectedOption={{
          label: selectedAnimation,
          value: selectedAnimation,
        }}
        onChange={(e) => {
          const value = e.detail.selectedOption.value;
          if (value) {
            const newSelectedAnimation = value;
            setSelectedAnimation(value);
            onChange(newSelectedAnimation);
          }
        }}
        options={options}
        selectedAriaLabel={intl.formatMessage({
          defaultMessage: 'Selected',
          description:
            'Specifies the localized string that describes an option as being selected. This is required to provide a good screen reader experience',
        })}
      />
    </Grid>
  );
};
