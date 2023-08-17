import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormField, Button, SpaceBetween, Autosuggest, Select } from '@awsui/components-react';
import { useIntl } from 'react-intl';

import { IValueDataBinding, IValueDataBindingProvider } from '../../../interfaces';
import {
  IAnimationComponentInternal,
  useEditorState,
  ISceneNodeInternal,
  useSceneDocument,
  useStore,
} from '../../../store';
import { useSceneComposerId } from '../../../common/sceneComposerIdContext';
import { animationObjectKey } from '../../three-fiber/AnimationComponent/AnimationComponent';

import { ValueDataBindingBuilder } from './common/ValueDataBindingBuilder';

export type AnimationViewStateEditorProps = {
  node: ISceneNodeInternal;
  component: IAnimationComponentInternal;
  onUpdate: (currentAnimations: string[], noderef: string, component: IAnimationComponentInternal) => void;
  onUpdateRule: (
    animationIndex: number,
    ruleBasedMapId: string | undefined,
    noderef: string,
    component: IAnimationComponentInternal,
  ) => void;
  onUpdateDataBinding: (
    noderef: string,
    valueDataBinding: IValueDataBinding,
    component: IAnimationComponentInternal,
  ) => void;
};
export const AnimationViewStateEditor: React.FC<AnimationViewStateEditorProps> = ({
  node,
  component: animationComponent,
  onUpdate,
  onUpdateRule,
  onUpdateDataBinding,
}: AnimationViewStateEditorProps) => {
  const { formatMessage } = useIntl();

  const [panelnumber, setPanelNumber] = useState(0);
  const sceneComposerId = useSceneComposerId();

  const { getObject3DBySceneNodeRef } = useEditorState(sceneComposerId);
  const object = getObject3DBySceneNodeRef(node.ref);
  //Scene is the name of the object3d of the model as given by the gltfLoader
  const animationList = object?.getObjectByName(animationObjectKey);
  const [selectedAnimations, setSelectedAnimations] = useState<string[] | undefined>();
  const { listSceneRuleMapIds } = useSceneDocument(sceneComposerId);
  const valueDataBindingProvider = useStore(sceneComposerId)(
    (state) => state.getEditorConfig().valueDataBindingProvider,
  );
  const intl = useIntl();

  const ruleMapIds = listSceneRuleMapIds();
  const selectedRuleMapId =
    animationComponent.ruleObject && ruleMapIds.includes(animationComponent.ruleObject[0].rule)
      ? animationComponent.ruleObject[0].rule
      : null;
  const ruleOptions = ruleMapIds
    .concat(
      selectedRuleMapId
        ? intl.formatMessage({
            defaultMessage: 'No Rule',
            description: 'signify No rule option to be selected in a drop down menu',
          })
        : [],
    )
    .map((ruleMapId) => ({ label: ruleMapId, value: ruleMapId }));

  const animationOptions = useMemo(
    () =>
      animationList?.animations.map((animation) => ({
        value: animation.name,
      })),
    [animationList],
  );

  const updateAnimations = useCallback(
    (animation, i) => {
      if (selectedAnimations) {
        const currentAnimations = [...selectedAnimations];
        currentAnimations[i] = animation;
        setSelectedAnimations(currentAnimations);
      }
    },
    [selectedAnimations],
  );

  const removeAnimation = useCallback(
    (i) => {
      if (selectedAnimations) {
        const currentAnimations = [...selectedAnimations];
        currentAnimations.splice(i, 1);
        setSelectedAnimations(currentAnimations);
      }
    },
    [selectedAnimations],
  );
  useEffect(() => {
    const currentAnimations: string[] = [...animationComponent.currentAnimations] || [];
    if (animationComponent.selector) {
      if (animationComponent.selector > panelnumber) {
        for (let i = panelnumber; i < animationComponent.selector; i++) {
          currentAnimations.push('');
          setPanelNumber(panelnumber + 1);
        }
      }
    }
    setSelectedAnimations(currentAnimations);
  }, [node.ref, animationComponent.selector]);

  useEffect(() => {
    if (selectedAnimations) {
      onUpdate(selectedAnimations, node.ref, animationComponent);
    }
  }, [selectedAnimations]);

  return (
    <SpaceBetween size='xs'>
      {selectedAnimations?.map((animation, i) => (
        <FormField label={formatMessage({ defaultMessage: 'Choose Animations', description: 'FormField label' })}>
          <Button variant='link' data-testid={'removeButton' + i} onClick={() => removeAnimation(i)}>
            {formatMessage({
              defaultMessage: 'remove',
              description: 'label for the remove animation button',
            })}
          </Button>
          <Autosuggest
            key={i}
            onChange={({ detail }) => updateAnimations(detail.value, i)}
            value={animation}
            options={animationOptions}
            ariaLabel={formatMessage({
              defaultMessage: 'Autosuggest example with suggestions',
              description: 'Specifies the animation thats being selected',
            })}
            placeholder={formatMessage({
              defaultMessage: 'Enter Value',
              description: 'Default Message for before an animation is selected',
            })}
            empty={formatMessage({
              defaultMessage: 'No matches found',
              description: 'label for when the user searches for a nonexistent animation',
            })}
            enteredTextLabel={function (): string {
              return formatMessage({
                defaultMessage: 'No matches found',
                description: 'label for when the user searches for a nonexistent animation',
              });
            }}
          />
          <Select
            data-testid='anchor-rule-id-select'
            selectedOption={
              animationComponent.ruleObject[i].rule
                ? { label: animationComponent.ruleObject[i].rule, value: animationComponent.ruleObject[i].rule }
                : null
            }
            onChange={(e) => {
              console.log(animationComponent.ruleObject[i], 'RULE');
              const ruleMapId = e.detail.selectedOption.value;
              onUpdateRule(i, ruleMapId, node.ref, animationComponent);
            }}
            options={ruleOptions}
            selectedAriaLabel={intl.formatMessage({
              defaultMessage: 'Selected',
              description:
                'Specifies the localized string that describes an option as being selected. This is required to provide a good screen reader experience',
            })}
            disabled={ruleMapIds.length === 0}
            placeholder={intl.formatMessage({ defaultMessage: 'Choose a rule', description: 'placeholder' })}
          />
        </FormField>
      ))}
      <ValueDataBindingBuilder
        componentRef={animationComponent.ref}
        binding={animationComponent.valueDataBinding}
        valueDataBindingProvider={valueDataBindingProvider as IValueDataBindingProvider}
        onChange={(valueDataBinding: IValueDataBinding) => {
          // we don't want to merge the dataBindingContext, so we'll need to manually replace it
          onUpdateDataBinding(node.ref, valueDataBinding, animationComponent);
        }}
      />
    </SpaceBetween>
  );
};
