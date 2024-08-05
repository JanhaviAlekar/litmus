import { Pagination, useToaster } from '@harnessio/uicore';
import React, { useEffect } from 'react';
import { listChaosInfra } from '@api/core';
import { getScope } from '@utils';
import ChaosInfrastructureReferenceFieldView from '@views/ChaosInfrastructureReferenceField';
import type { ChaosInfrastructureReferenceFieldProps } from '@models';
import type { InfrastructureDetails } from '@views/ChaosInfrastructureReferenceField/ChaosInfrastructureReferenceField';
import { listEnvironment } from '@api/core/environments';

function KubernetesChaosInfrastructureReferenceFieldController({
  setFieldValue,
  initialInfrastructureID,
  initialEnvironmentID
}: ChaosInfrastructureReferenceFieldProps): React.ReactElement {
  const scope = getScope();
  const { showError } = useToaster();
  const [searchInfrastructure, setSearchInfrastructure] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(0);
  const limit = 5;
  const [envID, setEnvID] = React.useState<string>('all');
  const [initialAllInfrastructureLength, setInitialAllInfrastructureLength] = React.useState<number>(0);
  const [activeEnv, setActiveEnv] = React.useState<string>('all');

  const { data: listChaosInfraData, loading: listChaosInfraLoading } = listChaosInfra({
    ...scope,
    environmentIDs: envID === 'all' ? undefined : [envID],
    filter: { name: searchInfrastructure },
    pagination: { page, limit },
    options: { onError: error => showError(error.message) }
  });

  const { data: listEnvironmentData } = listEnvironment({
    ...scope,
    options: {
      onError: err => showError(err.message)
    }
  });

  const environmentList = listEnvironmentData?.listEnvironments?.environments;

  React.useEffect(() => {
    if (envID === 'all' && listChaosInfraData?.listInfras?.totalNoOfInfras && searchInfrastructure === '') {
      setInitialAllInfrastructureLength(listChaosInfraData.listInfras.totalNoOfInfras);
    }
  }, [listChaosInfraData]);

  const preSelectedEnvironment = listEnvironmentData?.listEnvironments?.environments?.find(
    ({ environmentID }) => environmentID === initialEnvironmentID
  );

  // TODO: replace with get API as this becomes empty during edit
  const preSelectedInfrastructure = listChaosInfraData?.listInfras.infras.find(
    ({ infraID }) => infraID === initialInfrastructureID
  );

  const preSelectedInfrastructureDetails: InfrastructureDetails | undefined = preSelectedInfrastructure && {
    id: preSelectedInfrastructure?.infraID,
    name: preSelectedInfrastructure?.name,
    tags: preSelectedInfrastructure?.tags,
    isActive: preSelectedInfrastructure?.isActive,
    noOfExperiments: preSelectedInfrastructure?.noOfExperiments,
    noOfExperimentsRuns: preSelectedInfrastructure?.noOfExperimentRuns,
    environmentID: preSelectedInfrastructure?.environmentID
  };

  React.useEffect(() => {
    setPage(0);
  }, [envID]);

  useEffect(() => {
    if (preSelectedEnvironment) {
      setEnvID(preSelectedEnvironment?.environmentID), setActiveEnv(preSelectedEnvironment?.environmentID);
    }
  }, [preSelectedEnvironment, setFieldValue]);

  React.useEffect(() => {
    if (preSelectedInfrastructure) {
      setFieldValue('chaosInfrastructure.id', preSelectedInfrastructure.infraID, true);
      setFieldValue('chaosInfrastructure.namespace', preSelectedInfrastructure.infraNamespace, false);
      setFieldValue('chaosInfrastructure.serviceAccount', preSelectedInfrastructure.serviceAccount, false);
      setFieldValue('chaosInfrastructure.environmentID', preSelectedInfrastructure.environmentID, false);
    }
  }, [preSelectedInfrastructure, setFieldValue]);

  const infrastructureList = listChaosInfraData?.listInfras?.infras.map(infra => {
    const infraDetails: InfrastructureDetails = {
      id: infra.infraID,
      name: infra.name,
      tags: infra.tags,
      isActive: infra.isActive,
      noOfExperiments: infra.noOfExperiments,
      noOfExperimentsRuns: infra.noOfExperimentRuns,
      namespace: infra.infraNamespace,
      environmentID: infra.environmentID
    };
    return infraDetails;
  });

  const totalNoOfInfras = listChaosInfraData?.listInfras.totalNoOfInfras ?? 0;
  const PaginationComponent = (): React.ReactElement => {
    return (
      <Pagination
        itemCount={totalNoOfInfras}
        pageSize={limit}
        pageCount={Math.ceil(totalNoOfInfras / limit)}
        pageIndex={page}
        gotoPage={pageNumber => setPage(pageNumber)}
      />
    );
  };

  return (
    <ChaosInfrastructureReferenceFieldView
      infrastructureList={infrastructureList}
      preSelectedInfrastructure={preSelectedInfrastructureDetails}
      setInfrastructureValue={infrastructure => {
        if (infrastructure) {
          setFieldValue('chaosInfrastructure.id', infrastructure.id, true);
          setFieldValue('chaosInfrastructure.namespace', infrastructure.namespace, false);
          setFieldValue('chaosInfrastructure.environmentID', infrastructure.environmentID, false);
        }
      }}
      activeEnv={activeEnv}
      setActiveEnv={setActiveEnv}
      searchInfrastructure={searchInfrastructure}
      setSearchInfrastructure={setSearchInfrastructure}
      allInfrastructureLength={initialAllInfrastructureLength}
      environmentList={environmentList}
      setEnvID={setEnvID}
      loading={{
        listChaosInfra: listChaosInfraLoading
      }}
      pagination={<PaginationComponent />}
    />
  );
}

export default KubernetesChaosInfrastructureReferenceFieldController;
