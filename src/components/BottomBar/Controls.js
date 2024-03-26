import useMeasure from 'react-use-measure'
import { inject, observer } from 'mobx-react';
import { useCallback, useMemo, useState } from 'react';
import { IconBan } from '../../assets/icons';
import { LsChevron } from '../../assets/icons';
import { Button } from '../../common/Button/Button';
import { Dropdown } from '../../common/Dropdown/DropdownComponent';
import { Tooltip } from '../../common/Tooltip/Tooltip';
import { Block, Elem } from '../../utils/bem';
import { FF_PROD_E_111, isFF } from '../../utils/feature-flags';
import { isDefined } from '../../utils/utilities';
import './Controls.styl';

import { Modal, Select} from 'antd';
import {Stage, Layer, Rect, Line, Image} from 'react-konva';
import  * as ImageView from '../ImageView/ImageView';
import useImage from 'use-image';
import { container } from 'webpack';

// the first very simple and recommended way:


const TOOLTIP_DELAY = 0.8;

const ButtonTooltip = inject('store')(observer(({ store, title, children }) => {
  return (
    <Tooltip
      title={title}
      enabled={store.settings.enableTooltips}
      mouseEnterDelay={TOOLTIP_DELAY}
    >
      {children}
    </Tooltip>
  );
}));

const controlsInjector = inject(({ store }) => {
  return {
    store,
    history: store?.annotationStore?.selected?.history,
  };
});

const SegmentatorArea = ({imgSrc, col, polyCoords, zoom, containerSize}) => {

    const [image] = useImage(imgSrc);
  const SIZE = Math.floor(containerSize*3/7)

    let scaleFactor = 1;

    if (image) {
      if (image.naturalWidth > image.naturalHeight){
        scaleFactor = SIZE/image.naturalWidth
      } else {
        scaleFactor = SIZE/image.naturalHeight
      }
      console.log(image)
      console.log(image.naturalWidth)
      console.log(image.naturalHeight)
    console.log(polyCoords)
    }

  const [ref, bounds] = useMeasure()

  if (zoom) {
    
  }

  return (
          <>
{/*          <img
            src={imgSrc}
            alt={"lala"} 
            style={{
              width: "100%",
              height: "100%",
              gridColumnStart: col,
              gridColumnEnd: col,
              gridRowStart: 1,
              gridRowEnd: 1,
              zIndex: 1,
            }}
          />
              <div
            style={{
              width: "100%",
              height: "100%",
              gridColumnStart: col,
              gridColumnEnd: col,
              gridRowStart: 1,
              gridRowEnd: 1,
              zIndex: 2,
            }}
            ref={ref}
          >
              <Stage width={bounds.width} height={bounds.height}>
*/}
              <Stage width={SIZE} height={SIZE} scaleX={scaleFactor} scaleY={scaleFactor}>
                  <Layer>
                    <Image image={image}/>
                  </Layer>
                  {
                    polyCoords ?
                    <Layer>
                      {polyCoords.map(poly => <Line x={0} y={0} closed stroke="black" strokeWidth={50}
                            points={poly.points.flatMap(point => [
                              point.x/poly.canvasSize.width,
                              point.y/poly.canvasSize.height
                            ])}
                          />
                      ) }
                    </Layer> :
                    <></>
                  }
              </Stage>
{/*          </div>*/}
    </>
    
  )
}

const Segmentator = ({show, imgSrc, polyCoords}) => {

  const MODALSIZE = 1000


  function handleOk() {
    show.setter(false);
    // store.updateAnnotation = false
  };

  function handleCancel() {
    show.setter(false);
    // store.updateAnnotation = false
  };

  return (
      <Modal title="Basic Modal" open={show.state} onOk={handleOk} onCancel={handleCancel} width={1000}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "3fr 3fr 1fr",
          gridTemplateRows: "1fr"
        }}>
        <SegmentatorArea image={imgSrc} col={1} polyCoords={polyCoords} />
        <SegmentatorArea image={imgSrc} col={2} polyCoords={polyCoords} />
        <Select
          defaultValue="lucy"
          style={{
            width: 90,
            height: "100%",
            gridColumnStart: 3,
            gridColumnEnd: 3,
            gridRowStart: 1,
            gridRowEnd: 1,
          }}
          // onChange={handleChange}
          options={[
            {
              value: 'jack',
              label: 'Jack',
            },
            {
              value: 'lucy',
              label: 'Lucy',
            },
            {
              value: 'Yiminghe',
              label: 'yiminghe',
            },
          ]}
        />
        </div>
      </Modal>
  )
}

export const Controls = controlsInjector(observer(({ store, history, annotation }) => {
  const isReview = store.hasInterface('review');
  const isNotQuickView = store.hasInterface('topbar:prevnext');
  const historySelected = isDefined(store.annotationStore.selectedHistory);
  const { userGenerate, sentUserGenerate, versions, results, editable: annotationEditable } = annotation;
  const buttons = [];

  const [isInProgress, setIsInProgress] = useState(false);

  const disabled = !annotationEditable || store.isSubmitting || historySelected || isInProgress;
  const submitDisabled = store.hasInterface('annotations:deny-empty') && results.length === 0;
  
  const buttonHandler = useCallback(async (e, callback, tooltipMessage) => {
    const { addedCommentThisSession, currentComment, commentFormSubmit } = store.commentStore;
    
    if (isInProgress) return;
    setIsInProgress(true);

    const selected = store.annotationStore?.selected;

    if (addedCommentThisSession) {
      selected?.submissionInProgress();
      callback();
    } else if ((currentComment ?? '').trim()) {
      e.preventDefault();
      selected?.submissionInProgress();
      await commentFormSubmit();
      callback();
    } else {
      store.commentStore.setTooltipMessage(tooltipMessage);
    }
    setIsInProgress(false);
  }, [
    store.rejectAnnotation, 
    store.skipTask, 
    store.commentStore.currentComment, 
    store.commentStore.commentFormSubmit, 
    store.commentStore.addedCommentThisSession,
    isInProgress,
  ]);

  const RejectButton = useMemo(() => {
    return (
      <ButtonTooltip key="reject" title="Reject annotation: [ Ctrl+Space ]">
        <Button aria-label="reject-annotation" disabled={disabled} onClick={async (e) => {
          if (store.hasInterface('comments:reject') ?? true) {
            buttonHandler(e, () => store.rejectAnnotation({}), 'Please enter a comment before rejecting');
          } else {
            const selected = store.annotationStore?.selected;

            selected?.submissionInProgress();
            await store.commentStore.commentFormSubmit();
            store.rejectAnnotation({});
          }
        }}>
          Reject
        </Button>
      </ButtonTooltip>
    );
  }, [disabled, store]);

  if (isReview) {
    buttons.push(RejectButton);

    buttons.push(
      <ButtonTooltip key="accept" title="Accept annotation: [ Ctrl+Enter ]">
        <Button aria-label="accept-annotation" disabled={disabled} look="primary" onClick={async () => {
          const selected = store.annotationStore?.selected;

          selected?.submissionInProgress();
          await store.commentStore.commentFormSubmit();
          store.acceptAnnotation();
        }}>
          {history.canUndo ? 'Fix + Accept' : 'Accept'}
        </Button>
      </ButtonTooltip>,
    );
  } else if (annotation.skipped) {
    buttons.push(
      <Elem name="skipped-info" key="skipped">
        <IconBan color="#d00" /> Was skipped
      </Elem>);
    buttons.push(
      <ButtonTooltip key="cancel-skip" title="Cancel skip: []">
        <Button aria-label="cancel-skip" disabled={disabled} look="primary" onClick={async () => {
          const selected = store.annotationStore?.selected;

          selected?.submissionInProgress();
          await store.commentStore.commentFormSubmit();
          store.unskipTask();
        }}>
          Cancel skip
        </Button>
      </ButtonTooltip>,
    );
  } else {
    if (store.hasInterface('skip')) {
      buttons.push(
        <ButtonTooltip key="skip" title="Cancel (skip) task: [ Ctrl+Space ]">
          <Button aria-label="skip-task" disabled={disabled} onClick={async (e) => {
            if (store.hasInterface('comments:skip') ?? true) {
              buttonHandler(e, () => store.skipTask({}), 'Please enter a comment before skipping');
            } else {
              const selected = store.annotationStore?.selected;

              selected?.submissionInProgress();
              await store.commentStore.commentFormSubmit();
              store.skipTask({});
            }
          }}>
            Skip
          </Button>
        </ButtonTooltip>,
      );
    }

    const look = (disabled || submitDisabled) ? 'disabled' : 'primary';

    if (isFF(FF_PROD_E_111)) {
      const isDisabled = disabled || submitDisabled;
      const useExitOption = !isDisabled && isNotQuickView;

      const SubmitOption = ({ isUpdate, onClickMethod }) => {
        return (
          <Button
            name="submit-option"
            look="secondary"
            onClick={async (event) => {
              console.log("testando o butao 1")
              event.preventDefault();
              
              const selected = store.annotationStore?.selected;

              selected?.submissionInProgress();

              if ('URLSearchParams' in window) {
                const searchParams = new URLSearchParams(window.location.search);

                searchParams.set('exitStream', 'true');
                const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();

                window.history.pushState(null, '', newRelativePathQuery);
              }

              await store.commentStore.commentFormSubmit();
              onClickMethod();
            }}
          >
            {`${isUpdate ? 'Update' : 'Submit'} and exit`}
          </Button>
        );
      };

      if ((userGenerate) || (store.explore && !userGenerate && store.hasInterface('submit'))) {
        const title = submitDisabled
          ? 'Empty annotations denied in this project'
          : 'Save results: [ Ctrl+Enter ]';

        buttons.push(
          <ButtonTooltip key="submit" title={title}>
            <Elem name="tooltip-wrapper">
              <Button
                aria-label="submit"
                name="submit"
                disabled={isDisabled}
                look={look}
                mod={{ has_icon: useExitOption, disabled: isDisabled }}
                onClick={async (event) => {
              console.log("testando o butao 2")
                  if (event.target.classList.contains('lsf-dropdown__trigger')) return;  
                  const selected = store.annotationStore?.selected;

                  selected?.submissionInProgress();
                  await store.commentStore.commentFormSubmit();
                  store.submitAnnotation();
                }}
                icon={useExitOption && (
                  <Dropdown.Trigger
                    alignment="top-right"
                    content={<SubmitOption onClickMethod={store.submitAnnotation} isUpdate={false} />}
                  >
                    <div>
                      <LsChevron />
                    </div>
                  </Dropdown.Trigger>
                )}
              >
              Submit
              </Button>
            </Elem>
          </ButtonTooltip>,
        );
      }

      if ((userGenerate && sentUserGenerate) || (!userGenerate && store.hasInterface('update'))) {
        const isUpdate = sentUserGenerate || versions.result;
        const button = (
          <ButtonTooltip key="update" title="Update this task: [ Alt+Enter ]">
            <Button
              aria-label="submit"
              name="submit"
              disabled={disabled || submitDisabled}
              look={look}
              mod={{ has_icon: useExitOption, disabled: isDisabled }}
              onClick={async (event) => {
              console.log("testando o butao 3")
                if (event.target.classList.contains('lsf-dropdown__trigger')) return;
                const selected = store.annotationStore?.selected;

                selected?.submissionInProgress();
                await store.commentStore.commentFormSubmit();
                store.updateAnnotation();
              }}
              icon={useExitOption && (
                <Dropdown.Trigger
                  alignment="top-right" 
                  content={<SubmitOption onClickMethod={store.updateAnnotation} isUpdate={isUpdate} />}
                >
                  <div>
                    <LsChevron />
                  </div>
                </Dropdown.Trigger>
              )}
            >
              {isUpdate ? 'Update' : 'Submit'}
            </Button>
          </ButtonTooltip>
        );

        buttons.push(button);
      }  
    } else {
      if ((userGenerate) || (store.explore && !userGenerate && store.hasInterface('submit'))) {
        const title = submitDisabled
          ? 'Empty annotations denied in this project'
          : 'Save results: [ Ctrl+Enter ]';
  
        buttons.push(
          <ButtonTooltip key="submit" title={title}>
            <Elem name="tooltip-wrapper">
              <Button aria-label="submit" disabled={disabled || submitDisabled} look={look} onClick={async () => {
              console.log("testando o butao 4")
                const selected = store.annotationStore?.selected;

                selected?.submissionInProgress();
                await store.commentStore.commentFormSubmit();
                store.submitAnnotation();
              }}>
                Submit
              </Button>
            </Elem>
          </ButtonTooltip>,
        );
      }
  
      if ((userGenerate && sentUserGenerate) || (!userGenerate && store.hasInterface('update'))) {
        const isUpdate = sentUserGenerate || versions.result;
        const button = (
          <ButtonTooltip key="update" title="Update this task: [ Alt+Enter ]">
            <Button aria-label="submit" disabled={disabled || submitDisabled} look={look} onClick={async () => {
              console.log("testando o butao 5")
              const selected = store.annotationStore?.selected;

              selected?.submissionInProgress();
              await store.commentStore.commentFormSubmit();
              store.updateAnnotation();
            }}>
              {isUpdate ? 'Update' : 'Submit'}
            </Button>
          </ButtonTooltip>
        );
  
        buttons.push(button);
      }  


      store.updateAnnotation = false

      buttons.push(
        <ButtonTooltip key="submit" title={'Classificar'}>
          <Elem name="tooltip-wrapper">
            <Button aria-label="classificar" disabled={false} look={look} onClick={async () => {
            console.log("testando o butao 4")
              const selected = store.annotationStore?.selected;
              showModal()

              selected?.submissionInProgress();
              await store.commentStore.commentFormSubmit();
              store.submitAnnotation();
            }}>
              lalala
            </Button>
          </Elem>
        </ButtonTooltip>,
      );
    }
  }

  const [modalState, setModalState] = useState(false)
  const [polyCoords, setPolyCoords] = useState(null)

  // const isModalOpen = (state) =>  {
  //   store.updateAnnotation = state
  // }
  function showModal() {
    // store.updateAnnotation = true
    setModalState(true);
    console.log("testando o show modal")
    const canvasSize = store
      .annotationStore
      .selected
      .objects[0]
      .canvasSize
    console.log(canvasSize)
    setPolyCoords(
      store
      .annotationStore
      .annotations
      .filter(e => e.selected)[0]
      .regions.map(f => {
            return {
              points: f.points.map(g => {
                return {
                  x: g.x,
                  y: g.y,
                  canvasX: g.canvasX,
                  canvasY: g.canvasY,
                  relX: g.relativeX,
                  relY: g.relativeY,
              }}),
              canvasSize: canvasSize
      }})
    )
    console.log(store.task)

    console.log(polyCoords)
  };

  return (
    <Block name="controls">
      {buttons}
    <Segmentator
      show={{state: modalState, setter: setModalState}}
      imgSrc={store.task.dataObj.image}
      polyCoords={polyCoords}
    />
    </Block>
  );
}));

