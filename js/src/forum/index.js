import Model from 'flarum/common/Model';

import addSplitControl from './addSplitControl';
import SplitController from './components/SplitController';
import DiscussionSplit from './components/DiscussionSplit';

app.initializers.add('fof-split', (app) => {
    window.app.__fof_split = {
        splitting: false,
        showSplitTos: {},
        splitController: null,
    };

    window.app.__fof_split.splitController = new SplitController();

    app.store.models.discussions.prototype.canSplit = Model.attribute('canSplit');

    app.postComponents.discussionSplit = DiscussionSplit;

    addSplitControl();
});
