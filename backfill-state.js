// Scope progress to the selected public project key + region fingerprint.
const keyFor=project=>`backlog-run:${project}`;
export function saveBacklogRun(storage,run) {
 return storage.set(run.project?keyFor(run.project):'backlog-preview',run);
}
export function selectBacklogRun(storage,project,makeRun) {
 const legacy=storage.get('backlog-run',null);
 // Migrate the old singleton without losing a completed or partial upload for another project.
 if(legacy?.project&&!storage.get(keyFor(legacy.project),null)) {
  storage.set(keyFor(legacy.project),legacy);
 }
 let run=project?(storage.get(keyFor(project),null)||(legacy?.project===project?legacy:null)):storage.get('backlog-preview',null);
 if(!run||run.version<3&&!run.cursor&&!run.startedAt)run=makeRun();
 return {...run,...(project?{project}:{})};
}
