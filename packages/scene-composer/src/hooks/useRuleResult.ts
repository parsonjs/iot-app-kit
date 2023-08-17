import { useMemo } from 'react';

import { IValueDataBinding } from '../interfaces';
import { useSceneDocument, useDataStore } from '../store';
import { useSceneComposerId } from '../common/sceneComposerIdContext';
import { dataBindingValuesProvider, ruleEvaluator } from '../utils/dataBindingUtils';

const useRuleResult = (ruleMapId: string | string[], dataBinding: IValueDataBinding) => {
  const sceneComposerId = useSceneComposerId();
  const { getSceneRuleMapById } = useSceneDocument(sceneComposerId);
  const { dataBindingTemplate, dataInput } = useDataStore(sceneComposerId);
  if (typeof ruleMapId == 'string') {
    const rule = getSceneRuleMapById(ruleMapId);

    const ruleResult = useMemo(() => {
      const values: Record<string, any> = dataBindingValuesProvider(dataInput, dataBinding, dataBindingTemplate);
      return ruleEvaluator('', values, rule);
    }, [rule, dataInput, dataBinding]);

    return ruleResult;
  } else {
    const ruleResults: any[] = [];
    ruleMapId.forEach((ruleID) => {
      const rule = getSceneRuleMapById(ruleID);
      const values: Record<string, any> = dataBindingValuesProvider(dataInput, dataBinding, dataBindingTemplate);
      const ruleResult = ruleEvaluator('', values, rule);
      ruleResults.push(ruleResult);
    });
    return ruleResults;
  }
};

export default useRuleResult;
