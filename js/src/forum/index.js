import app from 'flarum/forum/app';
import Model from 'flarum/common/Model';

import addSplitControl from './addSplitControl';
import SplitController from './components/SplitController';
import DiscussionSplit from './components/DiscussionSplit';

app.initializers.add('fof-split', (app) => {
    app.store.models.discussions.prototype.canSplit = Model.attribute('canSplit');

    app.postComponents.discussionSplit = DiscussionSplit;

    const splitController = new SplitController();

    addSplitControl(splitController);
});
