import React from 'react';
import { Instrument, InstrumentType, Song, StepType, Track } from 'reactronica';
import { RecoilRoot, atom, useRecoilState, useRecoilValue } from 'recoil';
import StepsEditorV2 from '../components/StepsEditorV2';
import { MidiNote } from '../configs/midiConfig';
import { slabSong, vitaliseSampleFiles } from '../data/vitalise';
import { getDuration } from '../lib/get-duration';
import { useKeyPress } from '../lib/hooks';
import {
  // SampleId,
  transformIdStepNotes,
  createInstrumentSamples,
} from '../lib/sample-utils';

const isPlayingState = atom({
  key: 'isPlayingState',
  default: false,
});

const songsState = atom({
  key: 'songsState',
  default: [slabSong],
});

type TrackType = {
  id: string;
  range?: [number, number];
  steps: (
    | {
        id: string;
        duration: number;
        velocity: number;
      }
    | {
        name: MidiNote;
        duration: number;
        velocity: number;
      }
  )[][];
};

const tracksState = atom<TrackType[]>({
  key: 'tracksState',
  default: [
    {
      id: 'sampler',
      range: [0, 8],
      // range: [8, 16],
      steps: [
        // 0 ------------------------------------------------------------------
        [
          { id: 'guitar1', duration: getDuration(8, 70), velocity: 1 },
          { id: 'beat1', duration: getDuration(8, 70), velocity: 0.6 },
          { id: 'compassVox1', duration: getDuration(7, 70), velocity: 0.5 },
          // { id: 'soul4', duration: getDuration(1, 70), velocity: 0.8 },
          // { id: 'strum5', duration: getDuration(2, 70), velocity: 0.7 },
        ],
        null,
        [{ id: 'soul4', duration: getDuration(2, 70), velocity: 0.7 }],
        null,
        // 4 ------------------------------------------------------------------
        [{ id: 'soul4', duration: getDuration(1, 70), velocity: 0.8 }],
        null,
        [{ id: 'soul4', duration: getDuration(2, 70), velocity: 0.6 }],
        [{ id: 'strum5', duration: getDuration(2, 70), velocity: 0.7 }],
        // 8 ------------------------------------------------------------------
        [
          { id: 'guitar3', duration: getDuration(8, 70), velocity: 1 },
          // { id: 'beat2', duration: getDuration(8, 70), velocity: 1 },
          { id: 'kalimba2', duration: getDuration(8, 70), velocity: 1 },
          // { id: 'soul3', duration: getDuration(4, 70), velocity: 0.8 },
        ],
        null,
        null,
        null,
        // 12 ------------------------------------------------------------------
        [{ id: 'soul2', duration: getDuration(3, 70), velocity: 0.8 }],
        null,
        null,
        null,
      ],
    },
    {
      id: 'sub',
      steps: [
        [
          {
            name: 'C1',
            duration: getDuration(3, 70),
            velocity: 1,
          },
        ],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [
          {
            name: 'C1',
            duration: getDuration(1, 70),
            velocity: 1,
          },
        ],
        null,
        null,
        null,
        [
          {
            name: 'G#0',
            duration: getDuration(2, 70),
            velocity: 1,
          },
        ],
        null,
        null,
        null,
      ],
    },
  ],
});

const currentStepIndexState = atom({
  key: 'currentStepIndexState',
  default: 0,
});

const instrumentSamples = createInstrumentSamples(vitaliseSampleFiles);

const RecoilLivePage = () => {
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [currentStep, setCurrentState] = useRecoilState(currentStepIndexState);
  // const [tracks, setTracks] = useRecoilState(tracksState);
  const songs = useRecoilValue(songsState);
  const song = songs[0];
  const tracks = song.tracks;
  const clips = song.clips;

  // For PianoRoll, move to component?
  const sampleSteps = transformIdStepNotes(clips[0].steps, vitaliseSampleFiles);

  useKeyPress(
    ' ',
    () => setIsPlaying(!isPlaying),
    (e) => e.preventDefault(),
  );

  // console.log(
  //   currentStep,
  //   tracks[0].steps[currentStep + tracks[0].range[0]]
  //     ? tracks[0].steps[currentStep + tracks[0].range[0]].map((s) => s.id)
  //     : null,
  //   tracks[1].steps[currentStep] ? 'sub' : null,
  // );

  return (
    <>
      <p>{isPlaying ? 'Playing' : 'Stopped'}</p>

      {/* Move to component? */}
      <StepsEditorV2
        currentStepIndex={currentStep}
        steps={sampleSteps}
        startNote="C0"
        endNote="C2"
        subdivision={16}
      />

      <Song bpm={song.bpm} isPlaying={isPlaying} volume={0}>
        {tracks.map((track) => {
          const { clipId } = track;
          const clip = clips.find((clip) => clip.id === clipId);
          const steps = transformIdStepNotes(clip.steps, vitaliseSampleFiles);

          return (
            <Track
              steps={steps}
              key={track.id}
              onStepPlay={(stepNotes, index) => {
                setCurrentState(index);
              }}
            >
              <Instrument
                type="sampler"
                samples={instrumentSamples}
              ></Instrument>
            </Track>
          );
        })}

        {/* <Track steps={tracks[1].steps} key={'sub'}>
          <Instrument
            type="sampler"
            samples={{
              // C1: '/audio/samples/DECAP_808_long_midrange_distorted_C.wav',
              C1: '/audio/samples/Diginoiz_-_TDS_808_Kick_C_5.wav',
            }}
          ></Instrument>
        </Track> */}
      </Song>
    </>
  );
};

const RecoilPage = () => {
  return (
    <RecoilRoot>
      <RecoilLivePage />
    </RecoilRoot>
  );
};

export default RecoilPage;
