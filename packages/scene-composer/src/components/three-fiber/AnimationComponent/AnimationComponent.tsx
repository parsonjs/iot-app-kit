import React, { Fragment, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import { useSceneComposerId } from '../../../common/sceneComposerIdContext';
import { ISceneNodeInternal, useEditorState, useViewOptionState } from '../../../store';
import { IAnimationComponent } from '../../../interfaces';
import useRuleResult from '../../../hooks/useRuleResult';
import { getSceneResourceInfo } from '../../../utils/sceneResourceUtils';

export const toggleIsAnimationPaused = (
  AnimationMixer: THREE.AnimationMixer,
  isPaused: boolean,
  AnimationList: string[],
  ruleResult: any[],
) => {
  const object = AnimationMixer.getRoot() as THREE.Object3D;
  let i = 0;
  AnimationList.forEach(function (clip) {
    const animation = THREE.AnimationClip.findByName(object.animations, clip);
    if (AnimationMixer.clipAction(animation)) {
      AnimationMixer.clipAction(animation).paused = isPaused;
      if (ruleResult[i].ruleresult?.value == 'Stop') {
        AnimationMixer.clipAction(animation).paused = true;
      }
    }
    i++;
  });
};

interface AnimationComponentProps {
  component: IAnimationComponent;
  node: ISceneNodeInternal;
}
export const animationObjectKey = 'Scene';
const AnimationComponent: React.FC<AnimationComponentProps> = ({ component, node }) => {
  const sceneComposerId = useSceneComposerId();
  const isGlobalAnimationPaused = !useViewOptionState(sceneComposerId).componentVisibilities['Animation'];
  const [scene, setScene] = React.useState<THREE.Object3D>();
  const { getObject3DBySceneNodeRef } = useEditorState(sceneComposerId);
  const object = getObject3DBySceneNodeRef(node.ref);

  const rules: string[] = [];
  const values: object[] = [];

  component.ruleObject.forEach((ruleObj) => {
    rules.push(ruleObj.rule);
  });

  const ruleResults = useRuleResult(rules, component.valueDataBinding!) as string[];
  useEffect(() => {
    ruleResults.forEach((rule) => {
      values.push({ ruleresult: getSceneResourceInfo(rule as string) });
    });
  }, [ruleResults]);

  const currentAnimations = useMemo(() => {
    const currentAnimations: string[] = [];
    if (object) {
      // gltf loader sets this name for the object 3ds it loads
      setScene(object.getObjectByName(animationObjectKey));
      component.currentAnimations?.forEach((animation) => {
        currentAnimations.push(animation);
      });
    }
    return currentAnimations;
  }, [object, component]);

  const AnimationMixer = useMemo(() => {
    let AnimationMixer;
    if (scene) {
      AnimationMixer = new THREE.AnimationMixer(scene);
    }
    return AnimationMixer;
  }, [object, scene, component, node]);

  useEffect(() => {
    if (scene?.animations) {
      currentAnimations.forEach((clip) => {
        const animation = THREE.AnimationClip.findByName(scene.animations, clip);
        AnimationMixer.clipAction(animation)?.play();
      });
      toggleIsAnimationPaused(AnimationMixer, isGlobalAnimationPaused, currentAnimations, values);
    }
  }, [scene, isGlobalAnimationPaused, currentAnimations, component, AnimationMixer, values]);

  useFrame((state, delta) => {
    AnimationMixer?.update(delta);
  });
  return <Fragment />;
};

AnimationComponent.displayName = 'AnimationComponent';

export default AnimationComponent;
