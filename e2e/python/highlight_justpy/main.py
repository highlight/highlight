import logging

import justpy as jp

import highlight_io


class Highlight(jp.JustpyBaseComponent):
    vue_type = 'highlight'

    def __init__(self, **kwargs):
        self.options = jp.Dict()
        self.classes = ''
        self.style = ''
        self.show = True
        self.event_propagation = True
        self.pages = {}
        kwargs['temp'] = False  # Force an id to be assigned
        super().__init__(**kwargs)
        self.allowed_events = ['eventClick', 'eventDrop']
        if type(self.options) != jp.Dict:
            self.options = jp.Dict(self.options)
        self.initialize(**kwargs)

    def add_to_page(self, wp: jp.WebPage):
        wp.add_component(self)

    def react(self, data):
        pass

    async def run_method(self, command, websocket):
        await websocket.send_json({'type': 'run_method', 'data': command, 'id': self.id})
        # So the page itself does not update, return True not None
        return True


def my_click(self, msg):
    logging.info('click')
    self.text = 'I was clicked!'


def hello_world_readme2():
    logging.info('readme')
    wp = jp.WebPage()
    wp.head_html = '''
<script src="https://unpkg.com/highlight.run"></script>
<script>
    H.init('1', {
        serviceName: 'justpy-frontend',
        networkRecording: {
            enabled: true,
            recordHeadersAndBody: true,
        },
    });
</script>
'''
    d = jp.Div(text='Hello world!')
    d.on('click', my_click)
    wp.add(d)

    # calendar = Highlight(a=wp, classes='q-ma-lg', style='width: 700px;')
    return wp


H = highlight_io.H(
    "1",
    instrument_logging=True,
    service_name="justpy",
    service_version="git-sha",
    environment="production",
    debug=True,
)

jp.justpy(hello_world_readme2)
