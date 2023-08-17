import React, { useCallback, useContext } from 'react';

import { useStore, ISceneNodeInternal, IAnimationComponentInternal } from '../../../store';
import { sceneComposerIdContext } from '../../../common/sceneComposerIdContext';

import { AnimationViewStateEditor } from './AnimationViewStateEditor';

export type AnimationEditorProps = {
  node: ISceneNodeInternal;
  component: IAnimationComponentInternal;
};

export const AnimationComponentEditor: React.FC<AnimationEditorProps> = ({ ...props }) => {
  const sceneComposerId = useContext(sceneComposerIdContext);
  const updateComponentInternal = useStore(sceneComposerId)((state) => state.updateComponentInternal);
  // istanbul ignore next
  const onUpdate = useCallback(
    (currentAnimations, noderef, component) => {
      updateComponentInternal(noderef, { ...component, currentAnimations });
    },
    [updateComponentInternal],
  );
  const onUpdateRule = useCallback((animationIndex, ruleBasedMapId, noderef, component) => {
    const ruleObject = [...component.ruleObject];
    ruleObject.splice(animationIndex, 1, {
      animation: component.currentAnimations[animationIndex],
      rule: ruleBasedMapId,
    });
    updateComponentInternal(noderef, { ...component, ruleObject });
  }, []);
  const onUpdateDataBinding = useCallback((noderef, valueDataBinding, component) => {
    const updatedComponent = { ref: component.ref, type: component.type, valueDataBinding };
    updateComponentInternal(noderef, { ...updatedComponent });
  }, []);

  return (
    <AnimationViewStateEditor
      {...props}
      onUpdate={onUpdate}
      onUpdateRule={onUpdateRule}
      onUpdateDataBinding={onUpdateDataBinding}
    />
  );
};
