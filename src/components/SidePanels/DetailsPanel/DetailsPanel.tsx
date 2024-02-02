import { inject, observer } from 'mobx-react';
import { FC } from 'react';
import { Block, Elem } from '../../../utils/bem';
import { FF_DEV_2290, isFF } from '../../../utils/feature-flags';
import { Comments as CommentsComponent } from '../../Comments/Comments';
import { AnnotationHistory } from '../../CurrentEntity/AnnotationHistory';
import { PanelBase, PanelProps } from '../PanelBase';
import './DetailsPanel.styl';
import { RegionDetailsMain, RegionDetailsMeta } from './RegionDetails';
import { RegionItem } from './RegionItem';
import { Relations as RelationsComponent } from './Relations';
import Graph from './Graphs'
import Plot from 'react-plotly.js';

// eslint-disable-next-line
// @ts-ignore
import { DraftPanel } from '../../DraftPanel/DraftPanel';
interface DetailsPanelProps extends PanelProps {
  regions: any;
  selection: any;
}

const DetailsPanelComponent: FC<DetailsPanelProps> = ({ currentEntity, regions, ...props }) => {
  const selectedRegions = regions.selection;

  return (
    <PanelBase {...props} currentEntity={currentEntity} name="details" title="Details">
      <Content selection={selectedRegions} currentEntity={currentEntity} />
    </PanelBase>
  );
};

const DetailsComponent: FC<DetailsPanelProps> = ({ currentEntity, regions }) => {
  const selectedRegions = regions.selection;

  return (
    <Block name="details-tab">
      <Content selection={selectedRegions} currentEntity={currentEntity} />
    </Block>
  );
};


const Content: FC<any> = observer(({
  selection,
  currentEntity,
}) => {
  return (
    <>
      {(selection.size) ? (
        <RegionsPanel regions={selection}/>
      ) : (
        <GeneralPanel currentEntity={currentEntity}/>
      )}
    </>
  );
});


const CommentsTab: FC<any> = inject('store')(observer(({ store }) => {
  return (
    <>
      {store.hasInterface('annotations:comments') && store.commentStore.isCommentable && (
        <Block name="comments-panel">
          <Elem name="section-tab">
            <Elem name="section-content">
              <CommentsComponent annotationStore={store.annotationStore} commentStore={store.commentStore} cacheKey={`task.${store.task.id}`} />
            </Elem>
          </Elem>
        </Block>
      )}
    </>
  );
}));

const RelationsTab: FC<any> = inject('store')(observer(({ currentEntity }) => {
  const { relationStore } = currentEntity;

  return (
    <>
      <Block name="relations">
        <Elem name="section-tab">
          <Elem name="section-head">Relations ({relationStore.size})</Elem>
          <Elem name="section-content">
            <RelationsComponent relationStore={relationStore} />
          </Elem>
        </Elem>
      </Block>
    </>
  );
}));

const HistoryTab: FC<any> = inject('store')(observer(({ store, currentEntity }) => {
  const showAnnotationHistory = store.hasInterface('annotations:history');
  const showDraftInHistory = isFF(FF_DEV_2290);

  return (
    <>
      <Block name="history">
        {!showDraftInHistory ? (
          <DraftPanel item={currentEntity} />
        ) : (
          <Elem name="section-tab">
            <Elem name="section-head">
              Annotation History
              <span>#{currentEntity.pk ?? currentEntity.id}</span>
            </Elem>
            <Elem name="section-content">
              <AnnotationHistory inline showDraft={showDraftInHistory} enabled={showAnnotationHistory} />
            </Elem>
          </Elem>
        )}
      </Block>
    </>
  );
}));


const InfoTab: FC<any> = inject('store')(
  observer(({ selection }) => {
    return (
      <>
        <Block name="info">
          <Elem name="section-tab">
            <Elem name="section-head">
              Selection Details
            </Elem>
            <RegionsPanel regions={selection}/>
          </Elem>
        </Block>
      </>
    );
  }),
);

const GraphsTab: FC<any> = inject('store')(
  observer(({ selection }) => {

    function pressed(text: string) {
      console.log(text)
    };

    const plot_data = [
      ["2019-01-01",  87],
      ["2019-02-01",  97],
      ["2019-03-04",  81],
      ["2019-04-04",  67],
      ["2019-05-05",  15],
      ["2019-06-05",  69],
      ["2019-07-06",  49],
      ["2019-08-06",  58],
      ["2019-09-06",  49],
      ["2019-10-07",  94],
      ["2019-11-07",  25],
      ["2019-12-08",  56],
      ["2020-01-08",  9],
      ["2020-02-08",  86],
      ["2020-04-10",  13],
      ["2020-05-11",  60],
      ["2020-06-11",  6],
      ["2020-07-12",  27],
      ["2020-08-12",  16],
      ["2020-09-12",  66],
      ["2020-11-13",  55],
      ["2020-12-14",  62],
      ["2021-01-14",  51],
      ["2021-02-14",  6],
      ["2021-03-17",  37],
      ["2021-04-17",  13],
      ["2021-06-18",  84],
      ["2021-07-19",  4],
      ["2021-08-19",  31],
      ["2021-09-19",  35],
      ["2021-10-20",  13],
      ["2021-11-20",  99],
      ["2021-12-21",  32],
      ["2022-01-21",  90],
      ["2022-02-21",  84],
      ["2022-03-24",  60],
      ["2022-04-24",  23],
      ["2022-05-25",  76],
      ["2022-06-25",  25],
      ["2022-07-26",  88],
      ["2022-08-26",  12],
      ["2022-09-26",  13],
      ["2022-10-27",  55],
      ["2022-11-27",  59],
      ["2022-12-28",  99]
    ]

    const data = {
      name: 'NDVI',
      date: plot_data.map(e => e[0]),
      value: plot_data.map(e => e[1]),
    }

    // const zip = (a: Array<string>, b: Array<number>) => a.map((k, i) => {date:new Date(k); value: b[i]});
    //
    // const plot_data2 = zip(plot_data.x, plot_data.y);
      

    return (
      <>
        <Block name='Graphs'>
          <Elem name='section-tab'>
            <Elem name='section-head'>

              <button onClick={pressed('oi')}>oi2</button>
              graphs pannel
            </Elem>
            <RegionsPanel regions={selection}/>
            <Graph data={data}/>
          </Elem>
        </Block>
      </>
    );
  }),
);

const GeneralPanel: FC<any> = inject('store')(observer(({ store, currentEntity }) => {
  const { relationStore } = currentEntity;
  const showAnnotationHistory = store.hasInterface('annotations:history');
  const showDraftInHistory = isFF(FF_DEV_2290);

  return (
    <>
      {!showDraftInHistory ? (
        <DraftPanel item={currentEntity} />
      ) : (
        <Elem name="section">
          <Elem name="section-head">
              Annotation History
            <span>#{currentEntity.pk ?? currentEntity.id}</span>
          </Elem>
          <Elem name="section-content">
            <AnnotationHistory
              inline
              showDraft={showDraftInHistory}
              enabled={showAnnotationHistory}
            />
          </Elem>
        </Elem>
      )}
      <Elem name="section">
        <Elem name="section-head">
          Relations ({relationStore.size})
        </Elem>
        <Elem name="section-content">
          <RelationsComponent
            relationStore={relationStore}
          />
        </Elem>
      </Elem>
      {store.hasInterface('annotations:comments') && store.commentStore.isCommentable && (
        <Elem name="section">
          <Elem name="section-head">
            Comments
          </Elem>
          <Elem name="section-content">
            <CommentsComponent
              annotationStore={store.annotationStore} 
              commentStore={store.commentStore}
              cacheKey={`task.${store.task.id}`}
            />
          </Elem>
        </Elem>
      )}
    </>
  );
}));

GeneralPanel.displayName = 'GeneralPanel';

const RegionsPanel: FC<{regions: any}> = observer(({
  regions,
}) => {
  return (
    <div>
      {regions.list.map((reg: any) => {
        return (
          <SelectedRegion key={reg.id} region={reg}/>
        );
      })}
    </div>
  );
});

const SelectedRegion: FC<{region: any}> = observer(({
  region,
}) => {
  return (
    <RegionItem
      region={region}
      mainDetails={RegionDetailsMain}
      metaDetails={RegionDetailsMeta}
    />
  );
});

export const Comments = observer(CommentsTab);
export const History = observer(HistoryTab);
export const Relations = observer(RelationsTab);
export const Info = observer(InfoTab);
export const Details = observer(DetailsComponent);
export const DetailsPanel = observer(DetailsPanelComponent);
export const Graphs = observer(GraphsTab);
