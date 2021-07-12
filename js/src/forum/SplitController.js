export default class SplitController {
    constructor() {
        this.reset();
    }

    start(postId, postNumber) {
        this.reset();

        this.startPostId = postId;

        app.__fof_split.splitting = true;
        app.__fof_split.splittingFrom = postNumber;

        m.redraw();
    }

    end(postNumber) {
        this.endPostNumber = postNumber;

        app.__fof_split.splitting = false;
    }

    reset() {
        this.startPostId = null;
        this.endPostNumber = null;

        app.__fof_split.splitting = false;
        app.__fof_split.splittingFrom = undefined;
    }
}
